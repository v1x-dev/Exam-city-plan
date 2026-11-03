import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Building2, 
  ShieldCheck, 
  Printer, 
  ChevronDown, 
  Sparkles,
  School,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ExamSession } from '../types/seating';

export type NavTab = 'matrix' | 'roster' | 'halls' | 'invigilation' | 'print';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  sessions: ExamSession[];
  activeSession: ExamSession;
  onSelectSession: (session: ExamSession) => void;
  stats: {
    totalStudents: number;
    placedStudents: number;
    totalDesks: number;
    conflicts: number;
  };
  onOpenAlgorithmModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sessions,
  activeSession,
  onSelectSession,
  stats,
  onOpenAlgorithmModal,
}) => {
  const [sessionMenuOpen, setSessionMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'matrix' as NavTab, label: 'Seating Matrix', icon: LayoutGrid, count: null },
    { id: 'roster' as NavTab, label: 'Candidate Roster', icon: Users, count: stats.totalStudents },
    { id: 'halls' as NavTab, label: 'Exam Halls & Layout', icon: Building2, count: 4 },
    { id: 'invigilation' as NavTab, label: 'Invigilation Roster', icon: ShieldCheck, count: 10 },
    { id: 'print' as NavTab, label: 'Print Notices & Slips', icon: Printer, count: null },
  ];

  const occupancyRate = stats.totalDesks > 0 ? Math.round((stats.placedStudents / stats.totalDesks) * 100) : 0;

  return (
    <aside className="w-[260px] shrink-0 bg-[#142B4A] text-white flex flex-col justify-between border-r border-[#1E3A5F] select-none h-screen sticky top-0 z-20">
      {/* Top Branding Section */}
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div className="px-5 py-4 border-b border-[#1E3A5F]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm tracking-tight text-white leading-tight">
                Academic Seating
              </h1>
              <p className="text-[11px] text-[#93C5FD] font-mono tracking-tight leading-none mt-0.5">
                REGISTRAR ERP • v4.2
              </p>
            </div>
          </div>
        </div>

        {/* Active Session Dropdown Selector */}
        <div className="p-3 border-b border-[#1E3A5F]/60">
          <div className="relative">
            <button
              onClick={() => setSessionMenuOpen(!sessionMenuOpen)}
              className="w-full text-left bg-[#0A1A2F]/80 hover:bg-[#0A1A2F] border border-[#1E3A5F] rounded p-2.5 transition-colors flex items-center justify-between group focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-[#93A8C7]">
                  Active Exam Session
                </div>
                <div className="text-xs font-semibold text-white truncate mt-0.5">
                  {activeSession.title}
                </div>
                <div className="text-[11px] text-[#859AB9] font-mono mt-0.5 tabular-nums">
                  {activeSession.timeSlot}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#93A8C7] transition-transform ${sessionMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {sessionMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#0A1A2F] border border-[#1E3A5F] rounded shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSession(s);
                      setSessionMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[#142B4A] ${
                      s.id === activeSession.id ? 'bg-[#142B4A] text-[#93C5FD] font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate">{s.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 tabular-nums">
                      {s.date} • {s.timeSlot}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#7D93B7]">
            Examination Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#1E3A5F]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8EA6C9]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0A1A2F]/80 text-[#93A8C7]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Operational Summary Card & Quick Action */}
      <div className="p-3 border-t border-[#1E3A5F]/80 space-y-3">
        {/* Run Algorithm Quick CTA */}
        <button
          onClick={onOpenAlgorithmModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-semibold rounded shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Allocate / Reshuffle Desks</span>
        </button>

        {/* Live Integrity Stats */}
        <div className="bg-[#0A1A2F]/80 border border-[#1E3A5F] rounded p-2.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#93A8C7] uppercase font-semibold tracking-wider">Seated Ratio</span>
            <span className="font-mono text-white text-[11px] font-bold tabular-nums">
              {stats.placedStudents}/{stats.totalStudents} ({occupancyRate}%)
            </span>
          </div>

          <div className="w-full bg-[#1E3A5F] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1E3A5F]/50 text-[11px]">
            <span className="text-[#8EA6C9]">Spacing Conflicts</span>
            {stats.conflicts === 0 ? (
              <span className="inline-flex items-center gap-1 text-[#4ADE80] font-mono font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>0 Clear</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#F87171] font-mono font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>{stats.conflicts} Detected</span>
              </span>
            )}
          </div>
        </div>

        {/* Registrar Seal Micro Footer */}
        <div className="text-[10px] text-[#7084A5] text-center font-mono">
          ST. JUDE CENTRAL REGISTRAR
        </div>
      </div>
    </aside>
  );
};
