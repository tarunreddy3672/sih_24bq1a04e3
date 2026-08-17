export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  _id?: string;
  name: string;
  email?: string;
  role: UserRole;
  classOrSubject?: string;
  faceEmbedding?: number[];
  createdAt?: string | Date;
}

export interface AttendanceRecord {
  _id?: string;
  studentId: string | User;
  facultyId: string | User;
  date: string | Date;
  status: 'present' | 'absent';
  confidenceScore?: number;
  createdAt?: string | Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer?: number; // Kept optional on client side for security before submit
  topic: string;
}

export interface Quiz {
  _id?: string;
  subject: string;
  questions: QuizQuestion[];
  createdBy?: string | User;
  createdAt?: string | Date;
}

export interface QuizAttempt {
  _id?: string;
  quizId: string | Quiz;
  studentId: string | User;
  score: number;
  weakTopics: string[];
  createdAt?: string | Date;
}

export interface Feedback {
  _id?: string;
  studentId?: string | User;
  subjectOrFacultyId: string;
  rating: number;
  comment?: string;
  anonymized: boolean;
  createdAt?: string | Date;
}

export interface Streak {
  _id?: string;
  studentId: string | User;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  updatedAt?: string | Date;
}

export interface StudentProfile {
  user: User;
  streak: Streak | null;
  attendance: {
    overallPercentage: number;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    recent: AttendanceRecord[];
  };
  quizAttempts: QuizAttempt[];
  weakTopics: string[];
}

export interface InstitutionAnalytics {
  totalStudents: number;
  totalFaculty: number;
  averageAttendance: number;
  averageQuizScore: number;
  activeClassesCount: number;
  activeClasses: {
    id: string;
    class: string;
    subject: string;
    faculty: string;
    present: number;
    absent: number;
    total: number;
    attendancePercent: number;
    status: 'Active' | 'Upcoming' | 'Completed';
  }[];
  attendanceTrends: {
    date: string;
    attendance: number;
  }[];
  quizPerformance: {
    subject: string;
    averageScore: number;
    attemptsCount: number;
  }[];
  streakLeaderboard: {
    name: string;
    streak: number;
    badges: string[];
    classOrSubject: string;
  }[];
  feedbackStats: {
    averageRating: number;
    totalFeedback: number;
    breakdown: { rating: number; count: number }[];
  }[];
}
