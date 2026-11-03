import React from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Ban, 
  ArrowRight, 
  Grid,
  Users,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { ExamHall, Invigilator, Student } from '../types/seating';

interface HallsManagerProps {
  halls: ExamHall[];
  invigilators: Invigilator[];
  students: Student[];
  onSelectHallForMatrix: (hallId: string) => void;
  onToggleDeskBroken: (hallId: string, deskLabel: string) => void;
}

export const HallsManager: React.FC<HallsManagerProps> = ({
  halls,
  invigilators,
  students,
  onSelectHallForMatrix,
  onToggleDeskBroken,
}) => {
  const [selectedHallId, setSelectedHallId] = React.useState<string>(halls[0]?.id || '');
  const activeHall = halls.find((h) => h.id === selectedHallId) || halls[0];

  const assignedStudentsInActiveHall = students.filter((s) => s.assignedHallId === activeHall.id);
  const invigilatorsInActiveHall = invigilators.filter((inv) => inv.assignedHallId === activeHall.id);
  const brokenDesks = activeHall.desks.filter((d) => d.isBroken);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 overflow-y-auto">
      {/* Top Banner */}
      <div className="p-6 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-[#142B4A]">
            Campus Examination Venues & Hall Geometries
          </h2>
          <p className="text-xs text-[#64748B]">
            Configure architectural capacity, row/column matrices, aisle corridors, and out-of-order desk units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectHallForMatrix(activeHall.id)}
            className="h-8 px-3.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Open Seating Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Hall Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {halls.map((h) => {
            const isSelected = h.id === activeHall.id;
            const seated = students.filter((s) => s.assignedHallId === h.id).length;
            const pct = Math.round((seated / (h.activeCapacity || 1)) * 100);
            const hallInvs = invigilators.filter((i) => i.assignedHallId === h.id).length;

            return (
              <div
                key={h.id}
                onClick={() => setSelectedHallId(h.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2563EB] bg-white shadow-sm ring-1 ring-[#2563EB]'
                    : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                      {h.building.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        pct > 90
                          ? 'bg-[#FEF3C7] text-[#9A3412]'
                          : 'bg-[#DCFCE7] text-[#166534]'
                      }`}
                    >
                      {pct}% Full
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#142B4A] mt-1">
                    {h.name}
                  </h3>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#94A3B8]" />
                    <span>{h.floor}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Capacity:</span>
                    <span className="font-mono font-bold text-[#1E293B] tabular-nums">
                      {seated} / {h.activeCapacity} Seats
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Proctors: {hallInvs} Staff</span>
                    <span>{h.rows.length}R × {h.cols}C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hall Detailed Specifications */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                Hall Geometry & Structural Specifications
              </div>
              <h3 className="font-heading font-bold text-base text-[#142B4A] mt-0.5">
                {activeHall.name} ({activeHall.building})
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 bg-[#F1F5F9] rounded border border-[#CBD5E1] font-mono tabular-nums">
                <span className="text-[#64748B]">Rows: </span>
                <span className="font-bold text-[#1E293B]">{activeHall.rows.join(', ')}</span>
              </div>
              <div className="px-3 py-1.5 bg-[#F1F5F9] rounded border border-[#CBD5E1] font-mono tabular-nums">
                <span className="text-[#64748B]">Columns: </span>
                <span className="font-bold text-[#1E293B]">{activeHall.cols}</span>
              </div>
              <div className="px-3 py-1.5 bg-[#F1F5F9] rounded border border-[#CBD5E1] font-mono tabular-nums">
                <span className="text-[#64748B]">Aisle Split: </span>
                <span className="font-bold text-[#1E293B]">Cols {activeHall.aisleAfterCols.join(' & ')}</span>
              </div>
            </div>
          </div>

          {/* Out of service / damaged desks panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-xs text-[#1E293B] flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Damaged / Out-of-Service Desks ({brokenDesks.length})</span>
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Desks marked broken are automatically excluded from the algorithmic optimizer.
                </p>
              </div>
            </div>

            {brokenDesks.length === 0 ? (
              <div className="p-3 bg-[#DCFCE7]/60 border border-[#86EFAC] rounded text-xs text-[#166534] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                <span>All {activeHall.totalCapacity} desks in this hall are certified functional and operational.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {brokenDesks.map((d) => (
                  <div
                    key={d.id}
                    className="p-2 bg-[#FEE2E2]/60 border border-[#FCA5A5] rounded flex items-center justify-between text-xs"
                  >
                    <span className="font-mono font-bold text-[#991B1B]">{d.label}</span>
                    <button
                      onClick={() => onToggleDeskBroken(activeHall.id, d.label)}
                      className="text-[10px] text-[#2563EB] hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Invigilators in this venue */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
            <h4 className="font-semibold text-xs text-[#1E293B] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Assigned Proctors & Examination Invigilators ({invigilatorsInActiveHall.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {invigilatorsInActiveHall.map((inv) => (
                <div key={inv.id} className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#142B4A]">{inv.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#DBEAFE] text-[#1E40AF]">
                      {inv.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1 font-mono">
                    ID: {inv.facultyId} • {inv.department}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">
                    Contact: {inv.contact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
