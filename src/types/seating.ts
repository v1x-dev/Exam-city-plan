export type Department = 'Computer Science' | 'Electrical Eng' | 'Mechanical Eng' | 'Mathematics' | 'Biotechnology';

export type AccommodationType = 'None' | 'Wheelchair Access' | 'Extra Time (+30m)' | 'Quiet Perimeter';

export type AttendanceStatus = 'Verified' | 'Pending Check-in' | 'Absent';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: Department;
  cohort: string;
  courseCode: string;
  courseName: string;
  accommodation: AccommodationType;
  assignedHallId: string | null;
  assignedDeskId: string | null;
  assignedDeskLabel: string | null; // e.g. "A-04"
  status: AttendanceStatus;
}

export type DeskStatus = 'vacant' | 'assigned' | 'conflict' | 'accommodation' | 'broken';

export interface Desk {
  id: string; // e.g. "hall-a-A-01"
  hallId: string;
  row: string; // e.g. "A", "B", ...
  col: number; // 1, 2, ...
  label: string; // "A-01"
  isAisleRight?: boolean;
  isBroken?: boolean;
  studentId: string | null;
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface ExamHall {
  id: string;
  name: string;
  building: string;
  floor: string;
  rows: string[]; // e.g. ["A", "B", "C", "D", "E", "F", "G", "H"]
  cols: number; // e.g. 12
  aisleAfterCols: number[]; // e.g. [4, 8]
  totalCapacity: number;
  activeCapacity: number;
  desks: Desk[];
}

export interface Invigilator {
  id: string;
  name: string;
  facultyId: string;
  department: string;
  assignedHallId: string;
  role: 'Chief Proctor' | 'Invigilator' | 'Relief Officer';
  contact: string;
}

export interface ExamSession {
  id: string;
  code: string;
  title: string;
  date: string;
  timeSlot: string;
  duration: string;
  semester: string;
  chiefSuperintendent: string;
}

export type AlgorithmType = 'interleaved' | 'checkerboard' | 'alphabetical' | 'cohort_clumping';

export interface AlgorithmOptions {
  type: AlgorithmType;
  preventAdjacentSameDepartment: boolean;
  prioritizeAccommodationsFront: boolean;
  leaveBufferDesks: boolean;
  balanceHallsUniformly: boolean;
}
