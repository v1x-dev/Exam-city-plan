import { Student, ExamHall, AlgorithmOptions, Desk } from '../types/seating';

export interface AllocationResult {
  updatedStudents: Student[];
  updatedHalls: ExamHall[];
  placedCount: number;
  unplacedCount: number;
  conflictCount: number;
  conflicts: string[];
}

export function runSeatingAlgorithm(
  currentStudents: Student[],
  currentHalls: ExamHall[],
  options: AlgorithmOptions
): AllocationResult {
  // Deep clone students and halls
  const students: Student[] = currentStudents.map((s) => ({
    ...s,
    assignedHallId: null,
    assignedDeskId: null,
    assignedDeskLabel: null,
  }));

  const halls: ExamHall[] = currentHalls.map((h) => ({
    ...h,
    desks: h.desks.map((d) => ({
      ...d,
      studentId: null,
      hasConflict: false,
      conflictReason: undefined,
    })),
  }));

  // Separate candidates by accommodation priority if requested
  const accommodationsGroup = options.prioritizeAccommodationsFront
    ? students.filter((s) => s.accommodation === 'Wheelchair Access')
    : [];
  const otherStudents = options.prioritizeAccommodationsFront
    ? students.filter((s) => s.accommodation !== 'Wheelchair Access')
    : [...students];

  // If interleaved anti-cheating is requested, balance by department
  let orderedStudents: Student[] = [];

  if (options.type === 'interleaved' || options.preventAdjacentSameDepartment) {
    // Bucket by department
    const deptBuckets: Record<string, Student[]> = {};
    for (const st of otherStudents) {
      if (!deptBuckets[st.department]) {
        deptBuckets[st.department] = [];
      }
      deptBuckets[st.department].push(st);
    }

    const deptKeys = Object.keys(deptBuckets);
    let hasMore = true;
    let roundIndex = 0;

    const roundRobinList: Student[] = [];
    while (hasMore) {
      hasMore = false;
      for (const dept of deptKeys) {
        if (deptBuckets[dept].length > roundIndex) {
          roundRobinList.push(deptBuckets[dept][roundIndex]);
          hasMore = true;
        }
      }
      roundIndex++;
    }

    // Put wheelchair students first (to get Row A / Front Aisles)
    orderedStudents = [...accommodationsGroup, ...roundRobinList];
  } else if (options.type === 'checkerboard') {
    orderedStudents = [...accommodationsGroup, ...otherStudents];
  } else if (options.type === 'alphabetical') {
    const sorted = [...otherStudents].sort((a, b) => a.name.localeCompare(b.name));
    orderedStudents = [...accommodationsGroup, ...sorted];
  } else {
    orderedStudents = [...accommodationsGroup, ...otherStudents];
  }

  // Create a map of students for fast retrieval
  const studentMap = new Map<string, Student>();
  for (const s of orderedStudents) {
    studentMap.set(s.id, s);
  }

  let studentIdx = 0;
  let conflictCount = 0;
  const conflicts: string[] = [];

  // Iterate over halls
  for (const hall of halls) {
    // Sort desks logically row by row, col by col
    const sortedDesks = [...hall.desks].sort((a, b) => {
      if (a.row !== b.row) return a.row.localeCompare(b.row);
      return a.col - b.col;
    });

    for (let i = 0; i < sortedDesks.length; i++) {
      const desk = sortedDesks[i];

      // Skip broken desks
      if (desk.isBroken) {
        continue;
      }

      // If checkerboard buffer mode is active, skip alternating desks
      const rowIndex = hall.rows.indexOf(desk.row);
      if (options.leaveBufferDesks || options.type === 'checkerboard') {
        // Only seat on (row + col) % 2 === 0
        if ((rowIndex + desk.col) % 2 !== 0) {
          continue; // Leave vacant as buffer
        }
      }

      if (studentIdx >= orderedStudents.length) {
        break; // All students placed
      }

      const candidate = orderedStudents[studentIdx];

      // Assign student to desk
      desk.studentId = candidate.id;
      candidate.assignedHallId = hall.id;
      candidate.assignedDeskId = desk.id;
      candidate.assignedDeskLabel = desk.label;

      studentIdx++;
    }
  }

  // Conflict Detection Pass: Verify adjacent desks don't share the same department or course
  for (const hall of halls) {
    const deskGrid: Record<string, Record<number, Desk>> = {};
    for (const d of hall.desks) {
      if (!deskGrid[d.row]) deskGrid[d.row] = {};
      deskGrid[d.row][d.col] = d;
    }

    for (const d of hall.desks) {
      if (!d.studentId || d.isBroken) continue;
      const currentStudent = studentMap.get(d.studentId);
      if (!currentStudent) continue;

      // Check left and right neighbor
      const neighbors = [
        deskGrid[d.row]?.[d.col - 1],
        deskGrid[d.row]?.[d.col + 1],
      ].filter(Boolean);

      for (const neighbor of neighbors) {
        if (!neighbor.studentId || neighbor.isBroken) continue;
        const neighborStudent = studentMap.get(neighbor.studentId);
        if (!neighborStudent) continue;

        // If same course or department and anti-cheating was requested
        if (
          options.preventAdjacentSameDepartment &&
          neighborStudent.department === currentStudent.department &&
          neighborStudent.courseCode === currentStudent.courseCode
        ) {
          d.hasConflict = true;
          d.conflictReason = `Adjacent to ${neighborStudent.name} (${neighborStudent.department} / ${neighborStudent.courseCode})`;
          conflictCount++;
          const conflictMsg = `Hall ${hall.name}: Desk ${d.label} and ${neighbor.label} both belong to ${currentStudent.department} (${currentStudent.courseCode})`;
          if (!conflicts.includes(conflictMsg)) {
            conflicts.push(conflictMsg);
          }
        }
      }
    }
  }

  const placedCount = studentIdx;
  const unplacedCount = Math.max(0, orderedStudents.length - placedCount);

  return {
    updatedStudents: students,
    updatedHalls: halls,
    placedCount,
    unplacedCount,
    conflictCount,
    conflicts,
  };
}
