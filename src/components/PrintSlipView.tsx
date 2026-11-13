import React from 'react';
import { 
  Printer, 
  FileText, 
  Check, 
  Building, 
  School,
  Download,
  Copy
} from 'lucide-react';
import { Student, ExamHall, ExamSession } from '../types/seating';

interface PrintSlipViewProps {
  students: Student[];
  halls: ExamHall[];
  activeSession: ExamSession;
}

export const PrintSlipView: React.FC<PrintSlipViewProps> = ({
  students,
  halls,
  activeSession,
}) => {
  const [documentType, setDocumentType] = React.useState<'door' | 'desks' | 'muster'>('door');
  const [selectedHallId, setSelectedHallId] = React.useState<string>(halls[0]?.id || '');

  const activeHall = halls.find((h) => h.id === selectedHallId) || halls[0];
  const hallStudents = students
    .filter((s) => s.assignedHallId === activeHall.id)
    .sort((a, b) => (a.assignedDeskLabel || '').localeCompare(b.assignedDeskLabel || ''));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 overflow-y-auto">
      {/* Top Banner & Print Controls (Hidden on Print) */}
      <div className="p-6 bg-white border-b border-[#E2E8F0] no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-[#142B4A]">
              Official Examination Documents & Printable Rolls
            </h2>
            <p className="text-xs text-[#64748B]">
              Generate institutional-grade door notices, physical desk placement tags, and invigilator attendance muster rolls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-9 px-4 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#001632] rounded shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            >
              <Printer className="w-4 h-4 text-[#93C5FD]" />
              <span>Print Document (Ctrl+P)</span>
            </button>
          </div>
        </div>

        {/* Document Selection Tabs & Hall Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E2E8F0]">
          {/* Format Selector */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded border border-[#CBD5E1]">
            <button
              onClick={() => setDocumentType('door')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                documentType === 'door'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Hall Entrance Door Notice
            </button>
            <button
              onClick={() => setDocumentType('muster')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                documentType === 'muster'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Attendance & Signature Roll
            </button>
            <button
              onClick={() => setDocumentType('desks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                documentType === 'desks'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Printable Desk Placement Cards
            </button>
          </div>

          {/* Hall Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B] font-medium">Selected Hall:</span>
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] font-semibold focus:outline-none focus:border-[#2563EB]"
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({students.filter((s) => s.assignedHallId === h.id).length} examinees)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Sheet Canvas Container */}
      <div className="p-6 flex-1 flex justify-center">
        {/* Document Format 1: Hall Entrance Door Notice */}
        {documentType === 'door' && (
          <div className="w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-lg p-8 shadow-sm text-[#1E293B] print-page">
            {/* Formal University Masthead */}
            <div className="text-center pb-6 border-b-2 border-[#142B4A]">
              <div className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#142B4A]">
                ST. JUDE CENTRAL UNIVERSITY
              </div>
              <div className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mt-0.5">
                OFFICE OF THE REGISTRAR & CONTROLLER OF EXAMINATIONS
              </div>
              <div className="mt-3 font-heading font-bold text-xl text-[#001632]">
                EXAMINATION HALL SEATING CHART & ENTRANCE NOTICE
              </div>
              <div className="text-xs font-mono text-[#44474E] mt-1 tabular-nums">
                SESSION: {activeSession.title} • {activeSession.date} ({activeSession.timeSlot})
              </div>
            </div>

            {/* Hall Metadata Grid */}
            <div className="grid grid-cols-3 gap-4 py-4 border-b border-[#CBD5E1] text-xs">
              <div>
                <span className="text-[#64748B] uppercase text-[10px] font-bold">Venue Designation</span>
                <div className="font-bold text-sm text-[#142B4A]">{activeHall.name}</div>
                <div className="text-[11px] text-[#64748B]">{activeHall.building}</div>
              </div>

              <div>
                <span className="text-[#64748B] uppercase text-[10px] font-bold">Total Candidates Seated</span>
                <div className="font-bold text-sm text-[#142B4A] font-mono tabular-nums">
                  {hallStudents.length} Students Allocated
                </div>
                <div className="text-[11px] text-[#64748B]">Capacity: {activeHall.activeCapacity} Desks</div>
              </div>

              <div>
                <span className="text-[#64748B] uppercase text-[10px] font-bold">Chief Superintendent</span>
                <div className="font-bold text-xs text-[#142B4A]">{activeSession.chiefSuperintendent}</div>
                <div className="text-[10px] text-[#64748B]">Instructions: Bring ID & Matric Card</div>
              </div>
            </div>

            {/* Seating Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#142B4A] text-white font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2 px-3 w-20">Desk</th>
                    <th className="py-2 px-3">Roll Number</th>
                    <th className="py-2 px-3">Candidate Full Name</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Course Paper</th>
                    <th className="py-2 px-3 text-right">Accommodation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {hallStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748B]">
                        No candidates are currently allocated to {activeHall.name}.
                      </td>
                    </tr>
                  ) : (
                    hallStudents.map((s, idx) => (
                      <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                        <td className="py-2 px-3 font-mono font-bold text-[#142B4A] tabular-nums">
                          {s.assignedDeskLabel}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium tabular-nums text-[#1E293B]">
                          {s.rollNo}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#1E293B]">
                          {s.name}
                        </td>
                        <td className="py-2 px-3 text-[#44474E]">
                          {s.department}
                        </td>
                        <td className="py-2 px-3 font-mono text-[#142B4A]">
                          {s.courseCode}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {s.accommodation !== 'None' ? (
                            <span className="text-[#EA580C] font-semibold">
                              {s.accommodation}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Verification Footer Signatures */}
            <div className="mt-12 pt-6 border-t border-[#CBD5E1] grid grid-cols-2 gap-8 text-xs text-[#64748B]">
              <div>
                <div className="border-b border-dashed border-[#64748B] h-10 w-48 mb-1" />
                <div className="font-semibold text-[#1E293B]">Hall Chief Proctor Signature</div>
                <div className="text-[10px]">St. Jude Examination Board</div>
              </div>

              <div className="text-right">
                <div className="border-b border-dashed border-[#64748B] h-10 w-48 ml-auto mb-1" />
                <div className="font-semibold text-[#1E293B]">Registrar Seal & Date Verification</div>
                <div className="text-[10px]">Office of Academic Registry</div>
              </div>
            </div>
          </div>
        )}

        {/* Document Format 2: Attendance Muster Roll with Signatures */}
        {documentType === 'muster' && (
          <div className="w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-lg p-8 shadow-sm text-[#1E293B] print-page">
            <div className="text-center pb-4 border-b-2 border-[#142B4A]">
              <div className="font-heading font-extrabold text-base uppercase tracking-wider text-[#142B4A]">
                ST. JUDE CENTRAL UNIVERSITY • CONTROLLER OF EXAMINATIONS
              </div>
              <div className="mt-1 font-heading font-bold text-lg text-[#001632]">
                OFFICIAL INVIGILATION MUSTER ROLL & SIGNATURE SHEET
              </div>
              <div className="text-xs font-mono text-[#44474E] mt-0.5 tabular-nums">
                VENUE: {activeHall.name} • {activeSession.date} • {activeSession.timeSlot}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#142B4A] text-white font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-16">Seat</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Exam Paper</th>
                    <th className="py-2.5 px-3 w-36">Booklet Serial #</th>
                    <th className="py-2.5 px-3 w-40 text-center">Candidate Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {hallStudents.map((s, idx) => (
                    <tr key={s.id} className="h-10">
                      <td className="py-2 px-3 font-mono font-bold text-[#142B4A] tabular-nums">
                        {s.assignedDeskLabel}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-[#1E293B]">
                        {s.rollNo}
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#1E293B]">
                        {s.name}
                      </td>
                      <td className="py-2 px-3 font-mono text-[#44474E]">
                        {s.courseCode}
                      </td>
                      <td className="py-2 px-3 border-r border-[#CBD5E1]">
                        <div className="h-6 border-b border-dashed border-[#CBD5E1]" />
                      </td>
                      <td className="py-2 px-3">
                        <div className="h-6 border-b border-dashed border-[#CBD5E1]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Format 3: Desk Placement Cards (to tape to desks) */}
        {documentType === 'desks' && (
          <div className="w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-lg p-6 shadow-sm print-page">
            <div className="text-center pb-4 mb-4 border-b border-[#CBD5E1] text-xs text-[#64748B]">
              Print and slice along guidelines to affix to desk corners prior to candidate entry.
            </div>

            <div className="grid grid-cols-2 gap-4">
              {hallStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border-2 border-dashed border-[#142B4A] rounded bg-[#F8FAFC] flex flex-col justify-between h-40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        {activeHall.name.split(' ')[0]} {activeHall.name.split(' ')[1] || ''}
                      </div>
                      <div className="font-heading font-extrabold text-2xl text-[#142B4A]">
                        {s.assignedDeskLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#64748B]">Autumn Finals 2026</div>
                      <div className="font-mono text-xs font-semibold text-[#2563EB]">
                        {s.courseCode}
                      </div>
                    </div>
                  </div>

                  <div className="py-1 border-t border-b border-[#CBD5E1] my-auto">
                    <div className="font-bold text-sm text-[#1E293B] truncate">
                      {s.name}
                    </div>
                    <div className="font-mono text-xs text-[#44474E] tabular-nums">
                      Roll No: {s.rollNo}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>Dept: {s.department}</span>
                    {s.accommodation !== 'None' && (
                      <span className="font-bold text-[#EA580C]">
                        ★ {s.accommodation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
