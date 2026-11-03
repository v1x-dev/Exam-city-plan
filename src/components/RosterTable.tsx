import React from 'react';
import { 
  Student, 
  ExamHall, 
  AttendanceStatus 
} from '../types/seating';
import { 
  Search, 
  Filter, 
  Download, 
  CheckSquare, 
  Square, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Accessibility,
  Clock,
  VolumeX,
  UserCheck,
  UserX,
  Clock3
} from 'lucide-react';

interface RosterTableProps {
  students: Student[];
  halls: ExamHall[];
  onSelectStudent: (student: Student) => void;
  onUpdateAttendance: (studentId: string, newStatus: AttendanceStatus) => void;
  onNavigateToHallSeat: (hallId: string, deskLabel: string) => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  students,
  halls,
  onSelectStudent,
  onUpdateAttendance,
  onNavigateToHallSeat,
}) => {
  const [search, setSearch] = React.useState('');
  const [selectedDept, setSelectedDept] = React.useState<string>('all');
  const [selectedHall, setSelectedHall] = React.useState<string>('all');
  const [selectedAccomm, setSelectedAccomm] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const [sortField, setSortField] = React.useState<'rollNo' | 'name' | 'department' | 'courseCode' | 'desk'>('rollNo');
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);

  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);

  // Hall lookup map
  const hallMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const h of halls) {
      map.set(h.id, h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''));
    }
    return map;
  }, [halls]);

  // Unique departments & courses for filter dropdowns
  const departments = React.useMemo(() => {
    return Array.from(new Set(students.map((s) => s.department)));
  }, [students]);

  // Filtering & Sorting
  const filteredStudents = React.useMemo(() => {
    return students
      .filter((s) => {
        if (search) {
          const q = search.toLowerCase();
          const match =
            s.name.toLowerCase().includes(q) ||
            s.rollNo.toLowerCase().includes(q) ||
            s.courseCode.toLowerCase().includes(q) ||
            (s.assignedDeskLabel && s.assignedDeskLabel.toLowerCase().includes(q));
          if (!match) return false;
        }
        if (selectedDept !== 'all' && s.department !== selectedDept) return false;
        if (selectedHall !== 'all' && s.assignedHallId !== selectedHall) return false;
        if (selectedAccomm !== 'all') {
          if (selectedAccomm === 'has' && s.accommodation === 'None') return false;
          if (selectedAccomm === 'none' && s.accommodation !== 'None') return false;
        }
        if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'rollNo') cmp = a.rollNo.localeCompare(b.rollNo);
        else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'department') cmp = a.department.localeCompare(b.department);
        else if (sortField === 'courseCode') cmp = a.courseCode.localeCompare(b.courseCode);
        else if (sortField === 'desk') cmp = (a.assignedDeskLabel || '').localeCompare(b.assignedDeskLabel || '');
        return sortAsc ? cmp : -cmp;
      });
  }, [students, search, selectedDept, selectedHall, selectedAccomm, selectedStatus, sortField, sortAsc]);

  const toggleSort = (field: 'rollNo' | 'name' | 'department' | 'courseCode' | 'desk') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const rows = [
      ['Roll Number', 'Candidate Name', 'Department', 'Course Code', 'Hall', 'Desk Coordinate', 'Accommodation', 'Attendance Status'],
      ...filteredStudents.map((s) => [
        s.rollNo,
        s.name,
        s.department,
        s.courseCode,
        s.assignedHallId ? hallMap.get(s.assignedHallId) || s.assignedHallId : 'Unassigned',
        s.assignedDeskLabel || 'None',
        s.accommodation,
        s.status,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Academic_Seating_Roster_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 overflow-y-auto">
      {/* Table Header Filter Toolbar */}
      <div className="p-6 bg-white border-b border-[#E2E8F0] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-[#142B4A]">
              Master Candidate Roster & Allocation
            </h2>
            <p className="text-xs text-[#64748B]">
              High-density tabular roster of verified examinees with seating coordinates and attendance logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="h-8 px-3 text-xs font-semibold text-[#142B4A] bg-white border border-[#CBD5E1] rounded hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Export CSV Roster</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roll, name, desk..."
              className="w-full h-8 pl-8 pr-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Hall Filter */}
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="h-8 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Halls ({halls.length})</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Accommodation Filter */}
          <select
            value={selectedAccomm}
            onChange={(e) => setSelectedAccomm(e.target.value)}
            className="h-8 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Accommodations</option>
            <option value="has">With Accommodations Only</option>
            <option value="none">Standard Examination</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Attendance States</option>
            <option value="Verified">Verified Present</option>
            <option value="Pending Check-in">Pending Check-in</option>
            <option value="Absent">Marked Absent</option>
          </select>
        </div>
      </div>

      {/* High-Density Table Container */}
      <div className="p-6">
        <div className="bg-white border border-[#CBD5E1] rounded-lg shadow-xs overflow-hidden">
          {/* Table Header Summary */}
          <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1E293B]">Showing {filteredStudents.length} of {students.length} Candidates</span>
              {selectedStudentIds.length > 0 && (
                <span className="text-[#2563EB] font-mono">
                  ({selectedStudentIds.length} selected)
                </span>
              )}
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    selectedStudentIds.forEach((id) => onUpdateAttendance(id, 'Verified'));
                    setSelectedStudentIds([]);
                  }}
                  className="px-2 py-1 text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] rounded hover:bg-[#BBF7D0]"
                >
                  Mark Selected Verified
                </button>
                <button
                  onClick={() => {
                    selectedStudentIds.forEach((id) => onUpdateAttendance(id, 'Absent'));
                    setSelectedStudentIds([]);
                  }}
                  className="px-2 py-1 text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] rounded hover:bg-[#FECACA]"
                >
                  Mark Selected Absent
                </button>
              </div>
            )}
          </div>

          {/* Data Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 w-8">
                    <button onClick={toggleSelectAll} className="flex items-center">
                      {selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length ? (
                        <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#94A3B8]" />
                      )}
                    </button>
                  </th>

                  <th className="py-2.5 px-3 cursor-pointer hover:text-[#1E293B]" onClick={() => toggleSort('rollNo')}>
                    <div className="flex items-center gap-1">
                      <span>Roll Number</span>
                      {sortField === 'rollNo' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-2.5 px-3 cursor-pointer hover:text-[#1E293B]" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Candidate Name</span>
                      {sortField === 'name' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-2.5 px-3 cursor-pointer hover:text-[#1E293B]" onClick={() => toggleSort('department')}>
                    <div className="flex items-center gap-1">
                      <span>Department</span>
                      {sortField === 'department' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-2.5 px-3 cursor-pointer hover:text-[#1E293B]" onClick={() => toggleSort('courseCode')}>
                    <div className="flex items-center gap-1">
                      <span>Course Code</span>
                      {sortField === 'courseCode' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-2.5 px-3 cursor-pointer hover:text-[#1E293B]" onClick={() => toggleSort('desk')}>
                    <div className="flex items-center gap-1">
                      <span>Hall & Seat</span>
                      {sortField === 'desk' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-2.5 px-3">Accommodation</th>

                  <th className="py-2.5 px-3">Attendance</th>

                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#64748B]">
                      No candidates match your current search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    const hallName = s.assignedHallId ? hallMap.get(s.assignedHallId) : null;

                    return (
                      <tr
                        key={s.id}
                        className={`h-11 transition-colors ${
                          isSelected
                            ? 'bg-[#DBEAFE]/40 border-l-2 border-l-[#2563EB]'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => toggleSelectStudent(s.id)}
                            className="flex items-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#CBD5E1]" />
                            )}
                          </button>
                        </td>

                        {/* Roll Number (Tabular Mono) */}
                        <td className="py-2 px-3 font-mono font-medium text-[#1E293B] tabular-nums">
                          {s.rollNo}
                        </td>

                        {/* Candidate Name */}
                        <td className="py-2 px-3">
                          <div className="font-semibold text-[#1E293B]">{s.name}</div>
                          <div className="text-[10px] text-[#64748B]">{s.email}</div>
                        </td>

                        {/* Department */}
                        <td className="py-2 px-3 text-[#44474E]">
                          {s.department}
                        </td>

                        {/* Course Code */}
                        <td className="py-2 px-3">
                          <div className="font-mono font-semibold text-[#142B4A]">{s.courseCode}</div>
                          <div className="text-[10px] text-[#64748B] truncate max-w-44">{s.courseName}</div>
                        </td>

                        {/* Hall & Seat */}
                        <td className="py-2 px-3">
                          {s.assignedDeskLabel ? (
                            <button
                              onClick={() => s.assignedHallId && onNavigateToHallSeat(s.assignedHallId, s.assignedDeskLabel!)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-semibold text-xs bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#BFDBFE] transition-colors"
                              title="Click to view desk on hall matrix"
                            >
                              <span>{hallName?.split(' ')[0]}</span>
                              <span>•</span>
                              <span>{s.assignedDeskLabel}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-[#EA580C] bg-[#FEF3C7] px-2 py-0.5 rounded">
                              Unseated
                            </span>
                          )}
                        </td>

                        {/* Accommodation */}
                        <td className="py-2 px-3">
                          {s.accommodation === 'Wheelchair Access' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A3412] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                              <Accessibility className="w-3 h-3 text-[#EA580C]" />
                              <span>Wheelchair</span>
                            </span>
                          ) : s.accommodation === 'Extra Time (+30m)' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A3412] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-[#EA580C]" />
                              <span>+30m Extra</span>
                            </span>
                          ) : s.accommodation === 'Quiet Perimeter' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A3412] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                              <VolumeX className="w-3 h-3 text-[#EA580C]" />
                              <span>Quiet Room</span>
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-[11px]">—</span>
                          )}
                        </td>

                        {/* Attendance Status */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              const nextStatus: AttendanceStatus =
                                s.status === 'Verified'
                                  ? 'Absent'
                                  : s.status === 'Absent'
                                  ? 'Pending Check-in'
                                  : 'Verified';
                              onUpdateAttendance(s.id, nextStatus);
                            }}
                            className="focus:outline-none"
                            title="Click to cycle attendance status"
                          >
                            {s.status === 'Verified' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                                <UserCheck className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : s.status === 'Absent' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991B1B] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                                <UserX className="w-3 h-3" />
                                <span>Absent</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                                <Clock3 className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onSelectStudent(s)}
                            className="px-2.5 py-1 text-[11px] font-medium text-[#2563EB] hover:bg-[#DBEAFE]/50 rounded transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
