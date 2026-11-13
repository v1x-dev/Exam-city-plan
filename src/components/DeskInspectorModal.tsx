import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  BookOpen, 
  Accessibility, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  Mail,
  GraduationCap
} from 'lucide-react';
import { Student, Desk, ExamHall, AccommodationType, AttendanceStatus } from '../types/seating';

interface DeskInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  desk: Desk | null;
  hall: ExamHall | null;
  onUpdateAccommodation: (studentId: string, accommodation: AccommodationType) => void;
  onUpdateAttendance: (studentId: string, status: AttendanceStatus) => void;
  onUnseatStudent: (studentId: string) => void;
  onStartSwap: (desk: Desk) => void;
}

export const DeskInspectorModal: React.FC<DeskInspectorModalProps> = ({
  isOpen,
  onClose,
  student,
  desk,
  hall,
  onUpdateAccommodation,
  onUpdateAttendance,
  onUnseatStudent,
  onStartSwap,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[500px] bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden z-10 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-[#142B4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#2563EB] text-white font-heading font-bold flex items-center justify-center text-sm shadow-inner">
              {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base leading-tight">
                {student.name}
              </h3>
              <p className="text-[11px] text-[#93C5FD] font-mono">
                {student.rollNo} • {student.cohort}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#93C5FD] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-[#1E293B]">
          {/* Seat Coordinate Card */}
          <div className="p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#DBEAFE] text-[#1E40AF] font-heading font-bold flex items-center justify-center text-xs">
                {desk?.label || 'UN'}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#64748B]">
                  Designated Seat
                </div>
                <div className="font-semibold text-xs text-[#142B4A]">
                  {hall ? hall.name : 'Unassigned'} • Desk {desk?.label || 'None'}
                </div>
              </div>
            </div>

            {desk && (
              <button
                onClick={() => {
                  onStartSwap(desk);
                  onClose();
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] rounded flex items-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3 h-3 text-[#64748B]" />
                <span>Swap Desk</span>
              </button>
            )}
          </div>

          {/* Academic Profile Details */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              Examination Details
            </div>
            <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
              <div>
                <div className="text-[#64748B] text-[10px]">Academic Department</div>
                <div className="font-semibold text-[#1E293B] mt-0.5">{student.department}</div>
              </div>

              <div>
                <div className="text-[#64748B] text-[10px]">Course Code & Exam</div>
                <div className="font-mono font-semibold text-[#142B4A] mt-0.5">{student.courseCode}</div>
              </div>

              <div className="col-span-2">
                <div className="text-[#64748B] text-[10px]">Paper Title</div>
                <div className="font-medium text-[#1E293B] mt-0.5">{student.courseName}</div>
              </div>

              <div className="col-span-2">
                <div className="text-[#64748B] text-[10px]">Institutional Email</div>
                <div className="font-mono text-[#44474E] text-[11px] mt-0.5">{student.email}</div>
              </div>
            </div>
          </div>

          {/* Special Accommodations Selector */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              Accessibility & Accommodation Status
            </label>
            <select
              value={student.accommodation}
              onChange={(e) => onUpdateAccommodation(student.id, e.target.value as AccommodationType)}
              className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1E293B] font-medium focus:outline-none focus:border-[#2563EB]"
            >
              <option value="None">Standard Seating (No accommodation)</option>
              <option value="Wheelchair Access">Wheelchair Access (Requires Row A / Front Aisle)</option>
              <option value="Extra Time (+30m)">Extra Time (+30 min accommodation)</option>
              <option value="Quiet Perimeter">Quiet Perimeter (Reduced distraction placement)</option>
            </select>
          </div>

          {/* Attendance Check-in Control */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              Invigilator Roll Verification
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateAttendance(student.id, 'Verified')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  student.status === 'Verified'
                    ? 'bg-[#DCFCE7] text-[#166534] ring-1 ring-[#16A34A]'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateAttendance(student.id, 'Pending Check-in')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  student.status === 'Pending Check-in'
                    ? 'bg-[#DBEAFE] text-[#1E40AF] ring-1 ring-[#2563EB]'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateAttendance(student.id, 'Absent')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  student.status === 'Absent'
                    ? 'bg-[#FEE2E2] text-[#991B1B] ring-1 ring-[#DC2626]'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                <span>Absent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={() => {
              onUnseatStudent(student.id);
              onClose();
            }}
            className="text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Unseat Candidate</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
