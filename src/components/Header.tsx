import React from 'react';
import { 
  Search, 
  Sparkles, 
  Printer, 
  RotateCcw,
  SlidersHorizontal,
  Building
} from 'lucide-react';
import { ExamHall, Student } from '../types/seating';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  halls: ExamHall[];
  selectedHallId: string;
  onSelectHall: (hallId: string) => void;
  onOpenAlgorithmModal: () => void;
  onResetSeating: () => void;
  onNavigateToPrint: () => void;
  students: Student[];
  onSelectStudentDetail: (student: Student) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  halls,
  selectedHallId,
  onSelectHall,
  onOpenAlgorithmModal,
  onResetSeating,
  onNavigateToPrint,
  students,
  onSelectStudentDetail,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  const activeHall = halls.find((h) => h.id === selectedHallId) || halls[0];

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.courseCode.toLowerCase().includes(q) ||
          (s.assignedDeskLabel && s.assignedDeskLabel.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [students, searchQuery]);

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'matrix':
        return `Hall Seating Matrix • ${activeHall.name}`;
      case 'roster':
        return 'Master Candidate Roster & Allocation';
      case 'halls':
        return 'Exam Halls Infrastructure & Capacity';
      case 'invigilation':
        return 'Proctor Allocation & Hall Ratios';
      case 'print':
        return 'Official Seating Notices & Attendance Rolls';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Breadcrumbs & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="hover:text-[#1E293B] cursor-default font-medium">Registrar</span>
          <span>/</span>
          <span className="hover:text-[#1E293B] cursor-default font-medium">Exams 2026</span>
          <span>/</span>
        </div>
        <h2 className="font-heading font-semibold text-sm text-[#1E293B] truncate">
          {getBreadcrumbTitle()}
        </h2>
      </div>

      {/* Zone 2: Hall Selector (when on matrix view) & Instant Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
        {currentTab === 'matrix' && (
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded border border-[#CBD5E1]">
            {halls.map((h) => {
              const isSelected = h.id === selectedHallId;
              const seatedInHall = h.desks.filter((d) => d.studentId && !d.isBroken).length;
              return (
                <button
                  key={h.id}
                  onClick={() => onSelectHall(h.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-[#142B4A] shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <Building className="w-3 h-3 text-[#64748B]" />
                  <span>{h.name.split(' ')[0]} {h.name.split(' ')[1] || ''}</span>
                  <span className="font-mono text-[10px] text-[#64748B] bg-[#E2E8F0] px-1 py-0.2 rounded-full tabular-nums">
                    {seatedInHall}/{h.activeCapacity}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Global Student Lookup Input */}
        <div className="relative w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Find student, roll, or seat..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Quick Search Popover Result */}
          {showSearchResults && searchResults.length > 0 && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowSearchResults(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-[#CBD5E1] rounded-md shadow-lg z-40 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#64748B] border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  Matched Candidates ({searchResults.length})
                </div>
                {searchResults.map((stu) => (
                  <button
                    key={stu.id}
                    onClick={() => {
                      onSelectStudentDetail(stu);
                      setShowSearchResults(false);
                      setSearchQuery('');
                      if (stu.assignedHallId) {
                        onSelectHall(stu.assignedHallId);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F5F9] transition-colors border-b border-[#F1F5F9] last:border-none flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-[#1E293B]">{stu.name}</div>
                      <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                        {stu.rollNo} • {stu.courseCode}
                      </div>
                    </div>
                    <div className="text-right">
                      {stu.assignedDeskLabel ? (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF]">
                          {stu.assignedDeskLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#EA580C] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onResetSeating}
          title="Clear all allocated desk assignments"
          className="h-8 px-2.5 text-xs text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]/50 border border-[#E2E8F0] rounded font-medium transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={onNavigateToPrint}
          className="h-8 px-3 text-xs text-[#1E293B] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded font-medium transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Print Slips</span>
        </button>

        <button
          onClick={onOpenAlgorithmModal}
          className="h-8 px-3.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded shadow-xs transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run Algorithm</span>
        </button>
      </div>
    </header>
  );
};
