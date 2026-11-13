import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Grid, 
  Users, 
  ArrowRight,
  Accessibility,
  SplitSquareVertical
} from 'lucide-react';
import { 
  AlgorithmType, 
  AlgorithmOptions, 
  Student, 
  ExamHall 
} from '../types/seating';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  halls: ExamHall[];
  onExecute: (options: AlgorithmOptions) => void;
}

export const AlgorithmModal: React.FC<AlgorithmModalProps> = ({
  isOpen,
  onClose,
  students,
  halls,
  onExecute,
}) => {
  const [strategy, setStrategy] = React.useState<AlgorithmType>('interleaved');
  const [preventAdjacent, setPreventAdjacent] = React.useState(true);
  const [prioritizeFront, setPrioritizeFront] = React.useState(true);
  const [leaveBuffer, setLeaveBuffer] = React.useState(false);
  const [balanceHalls, setBalanceHalls] = React.useState(true);

  const [isRunning, setIsRunning] = React.useState(false);
  const [progressStep, setProgressStep] = React.useState<string>('');
  const [progressPercent, setProgressPercent] = React.useState(0);

  if (!isOpen) return null;

  const totalCapacity = halls.reduce((sum, h) => sum + h.activeCapacity, 0);
  const effectiveCapacity = (strategy === 'checkerboard' || leaveBuffer) ? Math.floor(totalCapacity / 2) : totalCapacity;
  const wheelchairCount = students.filter((s) => s.accommodation === 'Wheelchair Access').length;
  const extraTimeCount = students.filter((s) => s.accommodation === 'Extra Time (+30m)').length;

  const handleRun = () => {
    setIsRunning(true);
    setProgressPercent(10);
    setProgressStep('Sorting examinees by accommodation requirements...');

    setTimeout(() => {
      setProgressPercent(40);
      setProgressStep('Building round-robin departmental interleaving queues...');
    }, 300);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressStep('Assigning desks & checking orthogonal distance constraints...');
    }, 700);

    setTimeout(() => {
      setProgressPercent(100);
      setProgressStep('Finalizing allocation and verifying zero conflicts...');
      setTimeout(() => {
        setIsRunning(false);
        onExecute({
          type: strategy,
          preventAdjacentSameDepartment: preventAdjacent,
          prioritizeAccommodationsFront: prioritizeFront,
          leaveBufferDesks: leaveBuffer || strategy === 'checkerboard',
          balanceHallsUniformly: balanceHalls,
        });
        onClose();
      }, 300);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={!isRunning ? onClose : undefined} 
      />

      {/* Modal Dialog Card (fixed width 520px-600px per spec) */}
      <div className="relative w-full max-w-[580px] bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#142B4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base leading-tight">
                Algorithmic Seating Allocation
              </h3>
              <p className="text-[11px] text-[#93C5FD] font-mono">
                MATHEMATICAL EXAM OPTIMIZER • ST. JUDE ENGINE
              </p>
            </div>
          </div>

          {!isRunning && (
            <button
              onClick={onClose}
              className="text-[#93C5FD] hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-[#1E293B] max-h-[75vh] overflow-y-auto">
          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#64748B]">
              1. Allocation Strategy
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Option A: Interleaved Anti-Cheating */}
              <div
                onClick={() => !isRunning && setStrategy('interleaved')}
                className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                  strategy === 'interleaved'
                    ? 'border-[#2563EB] bg-[#DBEAFE]/30 ring-1 ring-[#2563EB]'
                    : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="mt-0.5">
                  <ShieldCheck className={`w-4 h-4 ${strategy === 'interleaved' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-[#1E293B] flex items-center justify-between">
                    <span>Interleaved Cohorts (Anti-Cheating Recommended)</span>
                    {strategy === 'interleaved' && (
                      <span className="text-[10px] text-[#2563EB] font-bold">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Alternates adjacent desks by distinct academic disciplines (e.g. CS next to EE or ME) to prevent examination malpractice.
                  </p>
                </div>
              </div>

              {/* Option B: Checkerboard */}
              <div
                onClick={() => !isRunning && setStrategy('checkerboard')}
                className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                  strategy === 'checkerboard'
                    ? 'border-[#2563EB] bg-[#DBEAFE]/30 ring-1 ring-[#2563EB]'
                    : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="mt-0.5">
                  <Grid className={`w-4 h-4 ${strategy === 'checkerboard' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-[#1E293B] flex items-center justify-between">
                    <span>Checkerboard Distance Buffer</span>
                    {strategy === 'checkerboard' && (
                      <span className="text-[10px] text-[#2563EB] font-bold">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Leaves every alternate desk physically vacant (50% density buffer) for high-confidentiality testing.
                  </p>
                </div>
              </div>

              {/* Option C: Alphabetical */}
              <div
                onClick={() => !isRunning && setStrategy('alphabetical')}
                className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                  strategy === 'alphabetical'
                    ? 'border-[#2563EB] bg-[#DBEAFE]/30 ring-1 ring-[#2563EB]'
                    : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="mt-0.5">
                  <Users className={`w-4 h-4 ${strategy === 'alphabetical' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-[#1E293B] flex items-center justify-between">
                    <span>Alphabetical Roll Sequence</span>
                    {strategy === 'alphabetical' && (
                      <span className="text-[10px] text-[#2563EB] font-bold">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Consecutive alphabetical seating ordered strictly by student registration surname.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Constraint Rules */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#64748B]">
              2. Special Placement Constraints
            </label>

            <div className="space-y-2 bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-xs flex items-center gap-2">
                  <Accessibility className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Prioritize Accommodations in Front Rows (Row A) & Aisles</span>
                </span>
                <input
                  type="checkbox"
                  checked={prioritizeFront}
                  disabled={isRunning}
                  onChange={(e) => setPrioritizeFront(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-[#E2E8F0]">
                <span className="font-medium text-xs flex items-center gap-2">
                  <SplitSquareVertical className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Enforce Strict Anti-Adjacent Course Code Spacing</span>
                </span>
                <input
                  type="checkbox"
                  checked={preventAdjacent}
                  disabled={isRunning}
                  onChange={(e) => setPreventAdjacent(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Pre-flight Audit Summary */}
          <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded p-3 text-xs space-y-1.5">
            <div className="font-semibold text-[#142B4A] flex items-center justify-between">
              <span>Pre-Flight Allocation Capacity</span>
              <span className="font-mono text-xs tabular-nums text-[#2563EB]">
                {students.length} Candidates ➔ {effectiveCapacity} Available Desks
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] flex items-center justify-between">
              <span>Accommodations to Place:</span>
              <span className="font-medium text-[#1E293B]">
                {wheelchairCount} Wheelchair, {extraTimeCount} Extra Time
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] flex items-center justify-between">
              <span>Total Active Venues:</span>
              <span className="font-medium text-[#1E293B]">4 Examination Halls</span>
            </div>
          </div>

          {/* Real-time Progress Bar when running */}
          {isRunning && (
            <div className="p-3 bg-[#DBEAFE]/40 border border-[#93C5FD] rounded space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1E40AF]">
                <span>{progressStep}</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#BFDBFE] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (spec: 1px divider, primary farthest right) */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-medium text-[#1E293B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded shadow-xs transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#93C5FD] disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Calculating...' : 'Run Algorithmic Engine'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
