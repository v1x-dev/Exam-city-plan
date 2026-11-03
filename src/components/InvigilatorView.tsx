import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  Building2, 
  AlertTriangle, 
  Plus, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { Invigilator, ExamHall, Student } from '../types/seating';

interface InvigilatorViewProps {
  invigilators: Invigilator[];
  halls: ExamHall[];
  students: Student[];
}

export const InvigilatorView: React.FC<InvigilatorViewProps> = ({
  invigilators,
  halls,
  students,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 overflow-y-auto">
      {/* Top Banner */}
      <div className="p-6 bg-white border-b border-[#E2E8F0]">
        <h2 className="font-heading font-bold text-lg text-[#142B4A]">
          Invigilation Duty Roster & Supervisory Ratios
        </h2>
        <p className="text-xs text-[#64748B]">
          Audit proctor-to-student statutory compliance ratios (target ≤ 1:30) and invigilator duty postings across all venues.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Hall-by-Hall Ratio Compliance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {halls.map((h) => {
            const seatedStudents = students.filter((s) => s.assignedHallId === h.id).length;
            const staff = invigilators.filter((inv) => inv.assignedHallId === h.id);
            const ratio = staff.length > 0 ? Math.round(seatedStudents / staff.length) : seatedStudents;
            const isCompliant = ratio <= 30;

            return (
              <div
                key={h.id}
                className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-[#142B4A]">
                      {h.name.split(' ')[0]} {h.name.split(' ')[1] || ''}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isCompliant
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {isCompliant ? 'Compliant' : 'High Ratio'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="text-2xl font-heading font-bold text-[#142B4A]">
                      1:{ratio}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {staff.length} Proctors covering {seatedStudents} Students
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between">
                  <span>Chief: {staff.find((i) => i.role === 'Chief Proctor')?.name.split(' ')[1] || 'Assigned'}</span>
                  <span className="font-mono text-[#1E293B]">Max 1:30</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Proctor Roster Table */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#142B4A]">
                Appointed Examination Invigilators ({invigilators.length})
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Faculty members assigned to examination oversight, identity verification, and attendance logging.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Faculty ID</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Home Department</th>
                  <th className="py-2.5 px-4">Assigned Venue</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Contact Phone</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {invigilators.map((inv) => {
                  const hall = halls.find((h) => h.id === inv.assignedHallId);
                  return (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors h-11">
                      <td className="py-2 px-4 font-mono text-[#1E293B] tabular-nums font-medium">
                        {inv.facultyId}
                      </td>
                      <td className="py-2 px-4 font-semibold text-[#142B4A]">
                        {inv.name}
                      </td>
                      <td className="py-2 px-4 text-[#44474E]">
                        {inv.department}
                      </td>
                      <td className="py-2 px-4 font-medium text-[#1E293B]">
                        {hall ? hall.name : inv.assignedHallId}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            inv.role === 'Chief Proctor'
                              ? 'bg-[#142B4A] text-white'
                              : inv.role === 'Relief Officer'
                              ? 'bg-[#FEF3C7] text-[#9A3412]'
                              : 'bg-[#DBEAFE] text-[#1E40AF]'
                          }`}
                        >
                          {inv.role}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-mono text-[#64748B]">
                        {inv.contact}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>On Duty</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
