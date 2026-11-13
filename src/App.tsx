/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  INITIAL_HALLS, 
  INITIAL_STUDENTS, 
  INITIAL_INVIGILATORS, 
  INITIAL_EXAM_SESSIONS 
} from './data/mockData';
import { 
  ExamHall, 
  Student, 
  Invigilator, 
  ExamSession, 
  Desk, 
  AccommodationType, 
  AttendanceStatus, 
  AlgorithmOptions 
} from './types/seating';
import { runSeatingAlgorithm } from './utils/seatingAlgorithms';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { SeatingMatrix } from './components/SeatingMatrix';
import { RosterTable } from './components/RosterTable';
import { HallsManager } from './components/HallsManager';
import { InvigilatorView } from './components/InvigilatorView';
import { PrintSlipView } from './components/PrintSlipView';
import { AlgorithmModal } from './components/AlgorithmModal';
import { DeskInspectorModal } from './components/DeskInspectorModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = React.useState<ExamSession[]>(INITIAL_EXAM_SESSIONS);
  const [activeSession, setActiveSession] = React.useState<ExamSession>(INITIAL_EXAM_SESSIONS[0]);
  const [currentTab, setCurrentTab] = React.useState<NavTab>('matrix');

  const [halls, setHalls] = React.useState<ExamHall[]>(INITIAL_HALLS);
  const [students, setStudents] = React.useState<Student[]>(INITIAL_STUDENTS);
  const [invigilators, setInvigilators] = React.useState<Invigilator[]>(INITIAL_INVIGILATORS);

  const [selectedHallId, setSelectedHallId] = React.useState<string>(INITIAL_HALLS[0].id);
  const [selectedDesk, setSelectedDesk] = React.useState<Desk | null>(null);

  // Inspector modal state
  const [inspectorOpen, setInspectorOpen] = React.useState<boolean>(false);
  const [inspectedStudent, setInspectedStudent] = React.useState<Student | null>(null);
  const [inspectedDesk, setInspectedDesk] = React.useState<Desk | null>(null);

  // Algorithm generator modal
  const [algorithmModalOpen, setAlgorithmModalOpen] = React.useState<boolean>(false);

  // Seat swap workflow
  const [swapSourceDesk, setSwapSourceDesk] = React.useState<Desk | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Run initial algorithmic distribution on mount so the app starts fully populated and coherent
  React.useEffect(() => {
    const result = runSeatingAlgorithm(INITIAL_STUDENTS, INITIAL_HALLS, {
      type: 'interleaved',
      preventAdjacentSameDepartment: true,
      prioritizeAccommodationsFront: true,
      leaveBufferDesks: false,
      balanceHallsUniformly: true,
    });
    setStudents(result.updatedStudents);
    setHalls(result.updatedHalls);
  }, []);

  // Compute live global stats
  const stats = React.useMemo(() => {
    const totalStudents = students.length;
    const placedStudents = students.filter((s) => s.assignedDeskId !== null).length;
    const totalDesks = halls.reduce((sum, h) => sum + h.activeCapacity, 0);
    const conflicts = halls.reduce(
      (sum, h) => sum + h.desks.filter((d) => d.hasConflict).length,
      0
    );
    return { totalStudents, placedStudents, totalDesks, conflicts };
  }, [students, halls]);

  // Execute algorithm from modal
  const handleExecuteAlgorithm = (options: AlgorithmOptions) => {
    const result = runSeatingAlgorithm(students, halls, options);
    setStudents(result.updatedStudents);
    setHalls(result.updatedHalls);
    setSelectedDesk(null);
    setSwapSourceDesk(null);

    showToast(
      `Allocated ${result.placedCount} candidates across ${halls.length} halls with ${result.conflictCount} conflicts.`,
      result.conflictCount === 0 ? 'success' : 'error'
    );
  };

  // Reset all seating
  const handleResetSeating = () => {
    if (!window.confirm('Are you sure you want to clear all current desk assignments?')) {
      return;
    }
    const resetStudents = students.map((s) => ({
      ...s,
      assignedHallId: null,
      assignedDeskId: null,
      assignedDeskLabel: null,
    }));
    const resetHalls = halls.map((h) => ({
      ...h,
      desks: h.desks.map((d) => ({
        ...d,
        studentId: null,
        hasConflict: false,
        conflictReason: undefined,
      })),
    }));
    setStudents(resetStudents);
    setHalls(resetHalls);
    setSelectedDesk(null);
    setSwapSourceDesk(null);
    showToast('All desk assignments have been cleared.', 'info');
  };

  // Toggle broken desk status
  const handleToggleBrokenDesk = (hallId: string, deskLabel: string) => {
    setHalls((prevHalls) =>
      prevHalls.map((h) => {
        if (h.id !== hallId) return h;
        const updatedDesks = h.desks.map((d) => {
          if (d.label === deskLabel) {
            const willBeBroken = !d.isBroken;
            // If was assigned to a student, unseat student
            if (willBeBroken && d.studentId) {
              setStudents((prevStudents) =>
                prevStudents.map((st) =>
                  st.id === d.studentId
                    ? {
                        ...st,
                        assignedHallId: null,
                        assignedDeskId: null,
                        assignedDeskLabel: null,
                      }
                    : st
                )
              );
            }
            return {
              ...d,
              isBroken: willBeBroken,
              studentId: willBeBroken ? null : d.studentId,
            };
          }
          return d;
        });

        const activeCapacity = updatedDesks.filter((d) => !d.isBroken).length;
        return {
          ...h,
          desks: updatedDesks,
          activeCapacity,
        };
      })
    );

    if (selectedDesk && selectedDesk.label === deskLabel) {
      setSelectedDesk((prev) => (prev ? { ...prev, isBroken: !prev.isBroken } : null));
    }
    showToast(`Desk ${deskLabel} status updated.`);
  };

  // Clear single desk assignment
  const handleClearDesk = (desk: Desk) => {
    if (!desk.studentId) return;
    const studentId = desk.studentId;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              assignedHallId: null,
              assignedDeskId: null,
              assignedDeskLabel: null,
            }
          : s
      )
    );

    setHalls((prev) =>
      prev.map((h) => {
        if (h.id !== desk.hallId) return h;
        return {
          ...h,
          desks: h.desks.map((d) =>
            d.id === desk.id
              ? { ...d, studentId: null, hasConflict: false, conflictReason: undefined }
              : d
          ),
        };
      })
    );

    setSelectedDesk((prev) =>
      prev ? { ...prev, studentId: null, hasConflict: false } : null
    );
    showToast(`Student unseated from ${desk.label}.`);
  };

  // Swap Seats workflow
  const handleStartSwap = (desk: Desk) => {
    setSwapSourceDesk(desk);
    showToast(`Select target desk to swap with ${desk.label}...`, 'info');
  };

  const handleExecuteSwap = (targetDesk: Desk) => {
    if (!swapSourceDesk || swapSourceDesk.id === targetDesk.id) {
      setSwapSourceDesk(null);
      return;
    }

    if (targetDesk.isBroken) {
      showToast(`Cannot swap to ${targetDesk.label} because desk is out of order.`, 'error');
      setSwapSourceDesk(null);
      return;
    }

    const sourceStudentId = swapSourceDesk.studentId;
    const targetStudentId = targetDesk.studentId;

    // Update students
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === sourceStudentId) {
          return {
            ...s,
            assignedHallId: targetDesk.hallId,
            assignedDeskId: targetDesk.id,
            assignedDeskLabel: targetDesk.label,
          };
        }
        if (s.id === targetStudentId) {
          return {
            ...s,
            assignedHallId: swapSourceDesk.hallId,
            assignedDeskId: swapSourceDesk.id,
            assignedDeskLabel: swapSourceDesk.label,
          };
        }
        return s;
      })
    );

    // Update halls
    setHalls((prev) =>
      prev.map((h) => {
        return {
          ...h,
          desks: h.desks.map((d) => {
            if (d.id === swapSourceDesk.id) {
              return { ...d, studentId: targetStudentId };
            }
            if (d.id === targetDesk.id) {
              return { ...d, studentId: sourceStudentId };
            }
            return d;
          }),
        };
      })
    );

    showToast(`Swapped desk ${swapSourceDesk.label} and ${targetDesk.label}.`);
    setSwapSourceDesk(null);
    setSelectedDesk(targetDesk);
  };

  // Inspect student detail modal
  const handleOpenInspector = (student: Student, desk: Desk) => {
    setInspectedStudent(student);
    setInspectedDesk(desk);
    setInspectorOpen(true);
  };

  // Update accommodation
  const handleUpdateAccommodation = (studentId: string, accommodation: AccommodationType) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, accommodation } : s))
    );
    if (inspectedStudent && inspectedStudent.id === studentId) {
      setInspectedStudent((prev) => (prev ? { ...prev, accommodation } : null));
    }
    showToast(`Updated accommodation for student.`);
  };

  // Update attendance
  const handleUpdateAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
    if (inspectedStudent && inspectedStudent.id === studentId) {
      setInspectedStudent((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Unseat student from inspector
  const handleUnseatStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !student.assignedDeskId) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              assignedHallId: null,
              assignedDeskId: null,
              assignedDeskLabel: null,
            }
          : s
      )
    );

    setHalls((prev) =>
      prev.map((h) => ({
        ...h,
        desks: h.desks.map((d) =>
          d.id === student.assignedDeskId
            ? { ...d, studentId: null, hasConflict: false }
            : d
        ),
      }))
    );
    showToast(`Candidate unseated.`);
  };

  const activeHall = halls.find((h) => h.id === selectedHallId) || halls[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Institutional Primary Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={setActiveSession}
        stats={stats}
        onOpenAlgorithmModal={() => setAlgorithmModalOpen(true)}
      />

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Navigation */}
        <Header
          currentTab={currentTab}
          halls={halls}
          selectedHallId={selectedHallId}
          onSelectHall={setSelectedHallId}
          onOpenAlgorithmModal={() => setAlgorithmModalOpen(true)}
          onResetSeating={handleResetSeating}
          onNavigateToPrint={() => setCurrentTab('print')}
          students={students}
          onSelectStudentDetail={(stu) => {
            const hall = halls.find((h) => h.id === stu.assignedHallId) || null;
            const desk = hall?.desks.find((d) => d.id === stu.assignedDeskId) || null;
            handleOpenInspector(stu, desk || {
              id: '',
              hallId: stu.assignedHallId || '',
              row: '',
              col: 0,
              label: stu.assignedDeskLabel || '',
              studentId: stu.id
            });
          }}
        />

        {/* View Routing */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {currentTab === 'matrix' && (
            <SeatingMatrix
              hall={activeHall}
              students={students}
              selectedDesk={selectedDesk}
              onSelectDesk={setSelectedDesk}
              onOpenInspector={handleOpenInspector}
              onToggleBrokenDesk={(d) => handleToggleBrokenDesk(d.hallId, d.label)}
              onClearDesk={handleClearDesk}
              swapSourceDesk={swapSourceDesk}
              onStartSwap={handleStartSwap}
              onExecuteSwap={handleExecuteSwap}
              onCancelSwap={() => setSwapSourceDesk(null)}
            />
          )}

          {currentTab === 'roster' && (
            <RosterTable
              students={students}
              halls={halls}
              onSelectStudent={(stu) => {
                const hall = halls.find((h) => h.id === stu.assignedHallId) || null;
                const desk = hall?.desks.find((d) => d.id === stu.assignedDeskId) || null;
                handleOpenInspector(stu, desk || {
                  id: '',
                  hallId: stu.assignedHallId || '',
                  row: '',
                  col: 0,
                  label: stu.assignedDeskLabel || '',
                  studentId: stu.id
                });
              }}
              onUpdateAttendance={handleUpdateAttendance}
              onNavigateToHallSeat={(hallId, deskLabel) => {
                setSelectedHallId(hallId);
                const targetHall = halls.find((h) => h.id === hallId);
                const targetDesk = targetHall?.desks.find((d) => d.label === deskLabel) || null;
                setSelectedDesk(targetDesk);
                setCurrentTab('matrix');
              }}
            />
          )}

          {currentTab === 'halls' && (
            <HallsManager
              halls={halls}
              invigilators={invigilators}
              students={students}
              onSelectHallForMatrix={(hallId) => {
                setSelectedHallId(hallId);
                setCurrentTab('matrix');
              }}
              onToggleDeskBroken={handleToggleBrokenDesk}
            />
          )}

          {currentTab === 'invigilation' && (
            <InvigilatorView
              invigilators={invigilators}
              halls={halls}
              students={students}
            />
          )}

          {currentTab === 'print' && (
            <PrintSlipView
              students={students}
              halls={halls}
              activeSession={activeSession}
            />
          )}
        </main>
      </div>

      {/* Algorithmic Placement Optimizer Modal */}
      <AlgorithmModal
        isOpen={algorithmModalOpen}
        onClose={() => setAlgorithmModalOpen(false)}
        students={students}
        halls={halls}
        onExecute={handleExecuteAlgorithm}
      />

      {/* Desk & Candidate Inspector Drawer Modal */}
      <DeskInspectorModal
        isOpen={inspectorOpen}
        onClose={() => {
          setInspectorOpen(false);
          setInspectedStudent(null);
          setInspectedDesk(null);
        }}
        student={inspectedStudent}
        desk={inspectedDesk}
        hall={inspectedDesk ? halls.find((h) => h.id === inspectedDesk.hallId) || null : null}
        onUpdateAccommodation={handleUpdateAccommodation}
        onUpdateAttendance={handleUpdateAttendance}
        onUnseatStudent={handleUnseatStudent}
        onStartSwap={handleStartSwap}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
          <div
            className={`px-4 py-2.5 rounded shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]'
                : toastMessage.type === 'info'
                ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1E40AF]'
                : 'bg-[#142B4A] border-[#1E3A5F] text-white shadow-xl'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
