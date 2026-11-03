import React from 'react';
import { 
  ExamHall, 
  Desk, 
  Student 
} from '../types/seating';
import { 
  AlertCircle, 
  Accessibility, 
  Clock, 
  VolumeX, 
  Ban, 
  UserCheck, 
  ArrowUp,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  ArrowRightLeft
} from 'lucide-react';

interface SeatingMatrixProps {
  hall: ExamHall;
  students: Student[];
  selectedDesk: Desk | null;
  onSelectDesk: (desk: Desk | null) => void;
  onOpenInspector: (student: Student, desk: Desk) => void;
  onToggleBrokenDesk: (desk: Desk) => void;
  onClearDesk: (desk: Desk) => void;
  swapSourceDesk: Desk | null;
  onStartSwap: (desk: Desk) => void;
  onExecuteSwap: (targetDesk: Desk) => void;
  onCancelSwap: () => void;
}

export const SeatingMatrix: React.FC<SeatingMatrixProps> = ({
  hall,
  students,
  selectedDesk,
  onSelectDesk,
  onOpenInspector,
  onToggleBrokenDesk,
  onClearDesk,
  swapSourceDesk,
  onStartSwap,
  onExecuteSwap,
  onCancelSwap,
}) => {
  const [scale, setScale] = React.useState<'compact' | 'standard' | 'large'>('standard');
  const [filterDepartment, setFilterDepartment] = React.useState<string>('all');

  // Map studentId to student object
  const studentMap = React.useMemo(() => {
    const map = new Map<string, Student>();
    for (const s of students) {
      map.set(s.id, s);
    }
    return map;
  }, [students]);

  // Desk size classes
  const deskSizeClass = {
    compact: 'w-11 h-11 text-[10px]',
    standard: 'w-14 h-14 text-xs',
    large: 'w-18 h-18 text-xs',
  }[scale];

  // Group desks by row
  const rowDesks = React.useMemo(() => {
    const grouped: Record<string, Desk[]> = {};
    for (const r of hall.rows) {
      grouped[r] = [];
    }
    for (const d of hall.desks) {
      if (grouped[d.row]) {
        grouped[d.row].push(d);
      }
    }
    // Ensure sorted by column
    for (const r of hall.rows) {
      grouped[r].sort((a, b) => a.col - b.col);
    }
    return grouped;
  }, [hall]);

  // Hall specific calculations
  const occupiedCount = hall.desks.filter((d) => d.studentId && !d.isBroken).length;
  const brokenCount = hall.desks.filter((d) => d.isBroken).length;
  const conflictCount = hall.desks.filter((d) => d.hasConflict).length;
  const accommodationsInHall = hall.desks.filter((d) => {
    if (!d.studentId) return false;
    const st = studentMap.get(d.studentId);
    return st && st.accommodation !== 'None';
  }).length;

  // Selected student
  const selectedStudent = selectedDesk && selectedDesk.studentId ? studentMap.get(selectedDesk.studentId) : null;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
      {/* Top Hall Metrics Banner */}
      <div className="px-6 py-4 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#64748B]">
              Venue & Capacity
            </div>
            <div className="font-heading font-bold text-base text-[#142B4A] flex items-center gap-2">
              <span>{hall.name}</span>
              <span className="text-xs font-normal text-[#64748B]">
                ({hall.building} • {hall.floor})
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#E2E8F0]" />

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#64748B]">Seated: </span>
              <span className="font-bold text-[#1E293B] font-mono tabular-nums">
                {occupiedCount} / {hall.activeCapacity}
              </span>
              <span className="text-[11px] text-[#64748B] ml-1">
                ({hall.activeCapacity > 0 ? Math.round((occupiedCount / hall.activeCapacity) * 100) : 0}%)
              </span>
            </div>

            <div>
              <span className="text-[#64748B]">Accommodations: </span>
              <span className="font-bold text-[#EA580C] font-mono tabular-nums">
                {accommodationsInHall}
              </span>
            </div>

            {conflictCount > 0 ? (
              <div className="text-[#DC2626] font-semibold flex items-center gap-1 bg-[#FEE2E2] px-2 py-0.5 rounded">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{conflictCount} Conflicts Flagged</span>
              </div>
            ) : (
              <div className="text-[#166534] font-medium flex items-center gap-1 bg-[#DCFCE7] px-2 py-0.5 rounded">
                <UserCheck className="w-3.5 h-3.5" />
                <span>0 Conflicts</span>
              </div>
            )}
          </div>
        </div>

        {/* View Controls & Zoom */}
        <div className="flex items-center gap-2">
          {swapSourceDesk && (
            <div className="flex items-center gap-2 bg-[#FEF3C7] text-[#9A3412] px-3 py-1 rounded border border-[#FDE68A] text-xs font-medium animate-pulse">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Click any desk to swap with {swapSourceDesk.label}</span>
              <button
                onClick={onCancelSwap}
                className="ml-1 text-[11px] underline hover:text-[#78350F]"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Density scale selector */}
          <div className="flex items-center bg-[#F1F5F9] rounded border border-[#CBD5E1] p-0.5 text-xs">
            <button
              onClick={() => setScale('compact')}
              className={`px-2 py-1 rounded transition-colors ${
                scale === 'compact' ? 'bg-white shadow-xs font-semibold text-[#142B4A]' : 'text-[#64748B]'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setScale('standard')}
              className={`px-2 py-1 rounded transition-colors ${
                scale === 'standard' ? 'bg-white shadow-xs font-semibold text-[#142B4A]' : 'text-[#64748B]'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setScale('large')}
              className={`px-2 py-1 rounded transition-colors ${
                scale === 'large' ? 'bg-white shadow-xs font-semibold text-[#142B4A]' : 'text-[#64748B]'
              }`}
            >
              Large
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="p-6 flex-1 flex flex-col items-center min-w-0">
        <div className="w-full max-w-5xl bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-xs relative">
          
          {/* LECTURE STAGE / SCREEN architectural indicator (from design spec) */}
          <div className="w-full mb-8">
            <div className="w-full h-9 bg-[#142B4A] rounded text-white flex items-center justify-center font-heading font-bold text-xs tracking-widest uppercase shadow-xs relative">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3.5 h-3.5 text-[#93C5FD]" />
                <span>LECTURE STAGE / PROJECTION SCREEN</span>
                <ArrowUp className="w-3.5 h-3.5 text-[#93C5FD]" />
              </div>
              <div className="absolute right-3 text-[10px] text-[#93C5FD] font-mono font-normal">
                FRONT OF ROOM
              </div>
            </div>
            {/* Visual stage podium platform steps */}
            <div className="w-3/4 mx-auto h-1.5 bg-[#CBD5E1]/60 rounded-b" />
          </div>

          {/* Room Seating Matrix Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="inline-block min-w-full">
              {hall.rows.map((rowName) => {
                const desks = rowDesks[rowName] || [];

                return (
                  <div key={rowName} className="flex items-center mb-3">
                    {/* Row Header Indicator */}
                    <div className="w-7 shrink-0 text-center font-heading font-bold text-xs text-[#64748B] select-none">
                      {rowName}
                    </div>

                    {/* Desks in this row with aisle gaps */}
                    <div className="flex items-center gap-2.5">
                      {desks.map((desk) => {
                        const student = desk.studentId ? studentMap.get(desk.studentId) : null;
                        const isSelected = selectedDesk?.id === desk.id;
                        const isSwapSource = swapSourceDesk?.id === desk.id;
                        const isConflict = desk.hasConflict;
                        const isAccommodated = student && student.accommodation !== 'None';
                        const isBroken = desk.isBroken;

                        // Calculate state styling exactly per design spec:
                        // - Vacant: white bg with subtle dashed outline (#CBD5E1), code in #94A3B8
                        // - Assigned: #F1F5F9 light neutral surface, solid border #CBD5E1
                        // - Selected: active ring 2px solid #2563EB, bg #DBEAFE
                        // - Conflict: #FEE2E2 fill, 1.5px #DC2626 border
                        // - Special Accommodations: #FEF3C7 fill with #EA580C boundary marker
                        // - Broken: Hatch / muted crossed out
                        let cardStyle = 'bg-white border border-dashed border-[#CBD5E1] text-[#94A3B8]';

                        if (isBroken) {
                          cardStyle = 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#94A3B8] opacity-50 cursor-not-allowed';
                        } else if (isConflict) {
                          cardStyle = 'bg-[#FEE2E2] border-[1.5px] border-[#DC2626] text-[#991B1B] font-semibold';
                        } else if (isSelected || isSwapSource) {
                          cardStyle = 'bg-[#DBEAFE] border-2 border-[#2563EB] text-[#1E40AF] ring-2 ring-[#2563EB]/20';
                        } else if (isAccommodated) {
                          cardStyle = 'bg-[#FEF3C7] border-[1.5px] border-[#EA580C] text-[#9A3412]';
                        } else if (student) {
                          cardStyle = 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] hover:border-[#2563EB]/60';
                        } else {
                          cardStyle = 'bg-white border border-dashed border-[#CBD5E1] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB]';
                        }

                        // Determine student department color indicator
                        let deptIndicator = 'bg-[#94A3B8]';
                        if (student) {
                          switch (student.department) {
                            case 'Computer Science':
                              deptIndicator = 'bg-[#2563EB]'; // Royal blue
                              break;
                            case 'Electrical Eng':
                              deptIndicator = 'bg-[#7C3AED]'; // Purple
                              break;
                            case 'Mechanical Eng':
                              deptIndicator = 'bg-[#059669]'; // Emerald
                              break;
                            case 'Mathematics':
                              deptIndicator = 'bg-[#D97706]'; // Amber
                              break;
                            case 'Biotechnology':
                              deptIndicator = 'bg-[#DB2777]'; // Rose
                              break;
                          }
                        }

                        return (
                          <React.Fragment key={desk.id}>
                            <div
                              onClick={() => {
                                if (isBroken && !swapSourceDesk) {
                                  onToggleBrokenDesk(desk);
                                  return;
                                }
                                if (swapSourceDesk) {
                                  onExecuteSwap(desk);
                                } else {
                                  onSelectDesk(desk);
                                }
                              }}
                              className={`relative rounded select-none cursor-pointer transition-all flex flex-col justify-between p-1 group ${deskSizeClass} ${cardStyle}`}
                              title={
                                student
                                  ? `${desk.label}: ${student.name} (${student.rollNo}) - ${student.department}`
                                  : isBroken
                                  ? `${desk.label}: Out of service / damaged desk`
                                  : `${desk.label}: Vacant Desk`
                              }
                            >
                              {/* Top Bar inside Desk Unit */}
                              <div className="flex items-center justify-between w-full leading-none">
                                <span className="font-mono text-[9px] font-semibold tracking-tight">
                                  {desk.label}
                                </span>
                                {student && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${deptIndicator}`}
                                    title={student.department}
                                  />
                                )}
                                {isBroken && <Ban className="w-2.5 h-2.5 text-[#DC2626]" />}
                              </div>

                              {/* Center Content: Student Name Initials or Roll abbreviation */}
                              <div className="text-center font-mono my-auto font-medium truncate w-full px-0.5">
                                {isBroken ? (
                                  <span className="text-[9px] text-[#94A3B8]">OFF</span>
                                ) : student ? (
                                  <div className="leading-tight">
                                    <div className="font-bold tracking-tight truncate text-[#1E293B]">
                                      {student.name.split(' ')[0]}
                                    </div>
                                    <div className="text-[8px] text-[#64748B] font-normal truncate">
                                      {student.rollNo.split('-').slice(1).join('-')}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-normal opacity-40">FREE</span>
                                )}
                              </div>

                              {/* Bottom Indicators (Accommodations or Conflict Tag) */}
                              <div className="flex items-center justify-between w-full leading-none">
                                {isConflict ? (
                                  <span className="w-full text-center text-[8px] text-[#DC2626] font-bold">
                                    CONFLICT
                                  </span>
                                ) : student?.accommodation === 'Wheelchair Access' ? (
                                  <Accessibility className="w-2.5 h-2.5 text-[#EA580C]" />
                                ) : student?.accommodation === 'Extra Time (+30m)' ? (
                                  <Clock className="w-2.5 h-2.5 text-[#EA580C]" />
                                ) : student?.accommodation === 'Quiet Perimeter' ? (
                                  <VolumeX className="w-2.5 h-2.5 text-[#EA580C]" />
                                ) : (
                                  <span />
                                )}

                                {student && (
                                  <span className="text-[8px] font-mono text-[#64748B] truncate ml-auto">
                                    {student.courseCode.substring(0, 4)}
                                  </span>
                                )}
                              </div>

                              {/* Hover Tooltip Preview */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                <div className="bg-[#142B4A] text-white text-[11px] p-2 rounded shadow-lg whitespace-nowrap min-w-32 border border-white/10">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Desk {desk.label}</span>
                                    {student && (
                                      <span className="text-[10px] font-mono text-[#93C5FD]">
                                        {student.courseCode}
                                      </span>
                                    )}
                                  </div>
                                  {student ? (
                                    <div className="mt-1 space-y-0.5">
                                      <div className="font-semibold text-white">{student.name}</div>
                                      <div className="text-[10px] text-slate-300 font-mono">
                                        Roll: {student.rollNo}
                                      </div>
                                      <div className="text-[10px] text-slate-300">
                                        Dept: {student.department}
                                      </div>
                                      {student.accommodation !== 'None' && (
                                        <div className="text-[10px] text-[#FDE68A] font-semibold">
                                          ★ {student.accommodation}
                                        </div>
                                      )}
                                    </div>
                                  ) : isBroken ? (
                                    <div className="text-[#FCA5A5] mt-1 text-[10px]">
                                      Out of service / broken desk
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 mt-1 text-[10px]">
                                      Vacant desk • Ready for allocation
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Aisle Corridor Separation */}
                            {desk.isAisleRight && (
                              <div className="w-6 shrink-0 flex flex-col items-center justify-center select-none">
                                <div className="h-full w-px bg-dashed border-r border-[#CBD5E1]" />
                                <span className="text-[8px] text-[#94A3B8] font-mono uppercase tracking-widest my-0.5">
                                  AISLE
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rear of Hall boundary indicator */}
          <div className="w-full mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div className="font-mono text-[11px]">
              REAR ENTRANCE / EXIT DOORS • HALL A
            </div>
            <div className="text-[11px]">
              Showing {hall.desks.length} Total Units • {hall.activeCapacity} Available
            </div>
          </div>
        </div>

        {/* Selected Desk Action Ribbon */}
        {selectedDesk && (
          <div className="w-full max-w-5xl mt-4 bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#DBEAFE] text-[#1E40AF] font-heading font-bold flex items-center justify-center text-xs">
                {selectedDesk.label}
              </div>
              <div>
                <div className="font-semibold text-xs text-[#1E293B] flex items-center gap-2">
                  <span>Desk {selectedDesk.label} in {hall.name}</span>
                  {selectedDesk.isBroken ? (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#FEE2E2] text-[#991B1B]">
                      Out of Service
                    </span>
                  ) : selectedStudent ? (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#DCFCE7] text-[#166534]">
                      Assigned: {selectedStudent.name} ({selectedStudent.rollNo})
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#F1F5F9] text-[#64748B]">
                      Vacant
                    </span>
                  )}
                </div>
                {selectedStudent && (
                  <div className="text-[11px] text-[#64748B]">
                    {selectedStudent.department} • Course: {selectedStudent.courseName}
                    {selectedStudent.accommodation !== 'None' && (
                      <span className="text-[#EA580C] font-semibold ml-2">
                        [{selectedStudent.accommodation}]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedStudent && (
                <button
                  onClick={() => onOpenInspector(selectedStudent, selectedDesk)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors"
                >
                  Inspect Candidate
                </button>
              )}

              <button
                onClick={() => onStartSwap(selectedDesk)}
                className="px-3 py-1.5 text-xs font-medium border border-[#CBD5E1] bg-white text-[#1E293B] rounded hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Swap Seat</span>
              </button>

              <button
                onClick={() => onToggleBrokenDesk(selectedDesk)}
                className="px-3 py-1.5 text-xs font-medium border border-[#CBD5E1] bg-white text-[#1E293B] rounded hover:bg-[#F8FAFC] transition-colors"
              >
                {selectedDesk.isBroken ? 'Restore Desk' : 'Mark Out of Order'}
              </button>

              {selectedStudent && (
                <button
                  onClick={() => onClearDesk(selectedDesk)}
                  className="px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2]/60 rounded transition-colors"
                >
                  Unseat
                </button>
              )}
            </div>
          </div>
        )}

        {/* Visual Legend (From Design Spec) */}
        <div className="w-full max-w-5xl mt-4 bg-white border border-[#E2E8F0] rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] mb-2">
            Seating Matrix State Legend
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-dashed border-[#CBD5E1] rounded" />
              <span className="text-[#64748B]">Vacant Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F1F5F9] border border-[#CBD5E1] rounded" />
              <span className="text-[#1E293B]">Assigned Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#DBEAFE] border-2 border-[#2563EB] rounded" />
              <span className="text-[#1E40AF]">Active / Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FEF3C7] border-[1.5px] border-[#EA580C] rounded" />
              <span className="text-[#9A3412]">Accommodation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FEE2E2] border-[1.5px] border-[#DC2626] rounded" />
              <span className="text-[#991B1B]">Seating Conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F1F5F9] border border-[#CBD5E1] rounded opacity-50 flex items-center justify-center">
                <Ban className="w-2.5 h-2.5 text-[#DC2626]" />
              </div>
              <span className="text-[#64748B]">Out of Order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
