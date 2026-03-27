export interface Student {
  id: string;
  name: string;
  email: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior" | string;
  courses: string[]; // Course IDs
  GPA: number;
}

export interface Course {
  id: string;
  title: string;
  instructors: string[]; // Faculty IDs
  enrollmentCount: number;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
}

export interface Grade {
  id?: string;
  studentId: string;
  courseId: string;
  grade: string;
}

export interface ReportData {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  averageGPA?: number;
}
