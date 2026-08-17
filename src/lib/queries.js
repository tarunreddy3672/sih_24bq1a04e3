import mongoose from 'mongoose';
import connectToDatabase from './mongodb.js';
import User from './models/User.js';
import AttendanceRecord from './models/AttendanceRecord.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Feedback from './models/Feedback.js';
import Streak from './models/Streak.js';
import { DEMO_USERS, DEMO_QUIZZES, DEMO_STREAKS } from './seed-data.js';

export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id);
}

// Ensure in-memory fallback store when MongoDB is not connected
let inMemoryStore = {
  users: [...DEMO_USERS],
  quizzes: [...DEMO_QUIZZES],
  streaks: [...DEMO_STREAKS],
  attendance: [
    {
      _id: '64f1a2b3c4d5e6f7a8b9c201',
      studentId: '64f1a2b3c4d5e6f7a8b9c001',
      facultyId: '64f1a2b3c4d5e6f7a8b9c004',
      date: new Date(Date.now() - 86400000 * 2),
      status: 'present',
      confidenceScore: 98,
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c202',
      studentId: '64f1a2b3c4d5e6f7a8b9c001',
      facultyId: '64f1a2b3c4d5e6f7a8b9c005',
      date: new Date(Date.now() - 86400000 * 1),
      status: 'present',
      confidenceScore: 95,
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c203',
      studentId: '64f1a2b3c4d5e6f7a8b9c001',
      facultyId: '64f1a2b3c4d5e6f7a8b9c004',
      date: new Date(),
      status: 'present',
      confidenceScore: 96,
    },
  ],
  quizAttempts: [
    {
      _id: '64f1a2b3c4d5e6f7a8b9c301',
      quizId: '64f1a2b3c4d5e6f7a8b9c101',
      studentId: '64f1a2b3c4d5e6f7a8b9c001',
      score: 75,
      weakTopics: ['MOSFET'],
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c302',
      quizId: '64f1a2b3c4d5e6f7a8b9c102',
      studentId: '64f1a2b3c4d5e6f7a8b9c001',
      score: 100,
      weakTopics: [],
      createdAt: new Date(Date.now() - 86400000 * 1),
    },
  ],
  feedback: [
    {
      _id: '64f1a2b3c4d5e6f7a8b9c401',
      studentId: null,
      subjectOrFacultyId: 'Digital Electronics & VLSI',
      rating: 5,
      comment: 'Exceptional circuit simulations and interactive lecture clarity.',
      anonymized: true,
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c402',
      studentId: null,
      subjectOrFacultyId: 'Data Structures & Algorithms',
      rating: 4,
      comment: 'Very practical problem sets, would love more graph theory practice.',
      anonymized: true,
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
  ],
};

export async function getUser(id) {
  if (!id) return null;
  const db = await connectToDatabase();
  if (db && isValidObjectId(id)) {
    try {
      return await User.findById(id).lean();
    } catch (e) {
      console.error('DB error in getUser:', e.message);
    }
  }
  return inMemoryStore.users.find((u) => u._id === id || String(u._id) === String(id)) || null;
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const db = await connectToDatabase();
  if (db) {
    try {
      return await User.findOne({ email: normalized }).lean();
    } catch (e) {
      console.error('DB error in getUserByEmail:', e.message);
    }
  }
  return inMemoryStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function createUser(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const user = new User(data);
      return await user.save();
    } catch (e) {
      console.error('DB error in createUser:', e.message);
      throw e;
    }
  }
  const newUser = {
    _id: '64f1a2b3c4d5e6f7a8b9c' + Math.floor(Math.random() * 8999 + 1000),
    createdAt: new Date(),
    ...data,
  };
  inMemoryStore.users.push(newUser);
  return newUser;
}

export async function createAttendanceRecord({ studentId, facultyId, date, status, confidenceScore }) {
  if (!studentId || !facultyId) throw new Error('Missing studentId or facultyId');
  const db = await connectToDatabase();
  if (db && isValidObjectId(studentId) && isValidObjectId(facultyId)) {
    try {
      const record = new AttendanceRecord({
        studentId,
        facultyId,
        date: date ? new Date(date) : new Date(),
        status: status || 'present',
        confidenceScore: confidenceScore || 95,
      });
      return await record.save();
    } catch (e) {
      console.error('DB error in createAttendanceRecord:', e.message);
      throw e;
    }
  }
  const record = {
    _id: '64f1a2b3c4d5e6f7a8b9c' + Math.floor(Math.random() * 8999 + 1000),
    studentId,
    facultyId,
    date: date ? new Date(date) : new Date(),
    status: status || 'present',
    confidenceScore: confidenceScore || 95,
    createdAt: new Date(),
  };
  inMemoryStore.attendance.push(record);
  return record;
}

export async function getAttendanceByStudent(studentId) {
  if (!studentId) return [];
  const db = await connectToDatabase();
  if (db && isValidObjectId(studentId)) {
    try {
      return await AttendanceRecord.find({ studentId }).sort({ date: -1 }).lean();
    } catch (e) {
      console.error('DB error in getAttendanceByStudent:', e.message);
    }
  }
  return inMemoryStore.attendance.filter(
    (a) => String(a.studentId) === String(studentId) || (a.studentId && a.studentId._id === studentId)
  );
}

export async function getAttendanceForFaculty(facultyId) {
  if (!facultyId) return [];
  const db = await connectToDatabase();
  if (db && isValidObjectId(facultyId)) {
    try {
      return await AttendanceRecord.find({ facultyId }).populate('studentId', 'name email classOrSubject').sort({ date: -1 }).lean();
    } catch (e) {
      console.error('DB error in getAttendanceForFaculty:', e.message);
    }
  }
  return inMemoryStore.attendance.map((a) => {
    const student = inMemoryStore.users.find((u) => String(u._id) === String(a.studentId));
    return { ...a, studentId: student || { name: 'Student', email: 'student@eduvision.ai' } };
  });
}

export async function getClassRoster(classOrSubject) {
  const db = await connectToDatabase();
  if (db) {
    try {
      return await User.find({ role: 'student', classOrSubject: classOrSubject || 'CSE-A' }).lean();
    } catch (e) {
      console.error('DB error in getClassRoster:', e.message);
    }
  }
  return inMemoryStore.users.filter((u) => u.role === 'student' && (!classOrSubject || u.classOrSubject === classOrSubject));
}

export async function createQuiz({ subject, questions, createdBy }) {
  if (!subject || !questions || !questions.length) throw new Error('Invalid quiz payload');
  const db = await connectToDatabase();
  if (db && isValidObjectId(createdBy)) {
    try {
      const quiz = new Quiz({ subject, questions, createdBy });
      return await quiz.save();
    } catch (e) {
      console.error('DB error in createQuiz:', e.message);
      throw e;
    }
  }
  const quiz = {
    _id: '64f1a2b3c4d5e6f7a8b9c' + Math.floor(Math.random() * 8999 + 1000),
    subject,
    questions,
    createdBy,
    createdAt: new Date(),
  };
  inMemoryStore.quizzes.push(quiz);
  return quiz;
}

export async function getQuizzes(subject) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = subject ? { subject } : {};
      const quizzes = await Quiz.find(filter).lean();
      return quizzes.map((q) => ({
        ...q,
        questions: q.questions.map((ques) => ({
          _id: ques._id,
          question: ques.question,
          options: ques.options,
          topic: ques.topic,
          // Correct answer is hidden from initial list
        })),
      }));
    } catch (e) {
      console.error('DB error in getQuizzes:', e.message);
    }
  }
  return inMemoryStore.quizzes
    .filter((q) => !subject || q.subject === subject)
    .map((q) => ({
      ...q,
      questions: q.questions.map((ques) => ({
        _id: ques._id,
        question: ques.question,
        options: ques.options,
        topic: ques.topic,
      })),
    }));
}

export async function getQuizById(quizId, sanitizeAnswers = true) {
  if (!quizId) return null;
  const db = await connectToDatabase();
  let quiz = null;
  if (db && isValidObjectId(quizId)) {
    try {
      quiz = await Quiz.findById(quizId).lean();
    } catch (e) {
      console.error('DB error in getQuizById:', e.message);
    }
  }
  if (!quiz) {
    quiz = inMemoryStore.quizzes.find((q) => String(q._id) === String(quizId)) || null;
  }
  if (!quiz) return null;

  if (sanitizeAnswers) {
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        topic: q.topic,
      })),
    };
  }
  return quiz;
}

export async function submitQuizAttempt({ quizId, studentId, selectedAnswers }) {
  if (!quizId || !studentId) throw new Error('Missing quizId or studentId');
  const fullQuiz = await getQuizById(quizId, false);
  if (!fullQuiz) throw new Error('Quiz not found');

  let correctCount = 0;
  const weakTopics = [];
  const breakdown = [];

  fullQuiz.questions.forEach((q, idx) => {
    const studentAnswer = selectedAnswers[idx];
    const isCorrect = studentAnswer === q.correctAnswer;
    if (isCorrect) {
      correctCount++;
    } else {
      if (q.topic && !weakTopics.includes(q.topic)) {
        weakTopics.push(q.topic);
      }
    }
    breakdown.push({
      question: q.question,
      topic: q.topic,
      selectedAnswer: studentAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    });
  });

  const score = Math.round((correctCount / fullQuiz.questions.length) * 100);

  const db = await connectToDatabase();
  let attemptResult;
  if (db && isValidObjectId(quizId) && isValidObjectId(studentId)) {
    try {
      const attempt = new QuizAttempt({
        quizId,
        studentId,
        score,
        weakTopics,
      });
      attemptResult = await attempt.save();
    } catch (e) {
      console.error('DB error in submitQuizAttempt:', e.message);
    }
  }

  if (!attemptResult) {
    attemptResult = {
      _id: '64f1a2b3c4d5e6f7a8b9c' + Math.floor(Math.random() * 8999 + 1000),
      quizId,
      studentId,
      score,
      weakTopics,
      createdAt: new Date(),
    };
    inMemoryStore.quizAttempts.push(attemptResult);
  }

  // Update streak after quiz
  await updateStreak(studentId, true);

  return {
    attemptId: attemptResult._id,
    score,
    correctCount,
    totalQuestions: fullQuiz.questions.length,
    weakTopics,
    breakdown,
  };
}

export async function getQuizAttemptsByStudent(studentId) {
  if (!studentId) return [];
  const db = await connectToDatabase();
  if (db && isValidObjectId(studentId)) {
    try {
      return await QuizAttempt.find({ studentId }).populate('quizId', 'subject').sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.error('DB error in getQuizAttemptsByStudent:', e.message);
    }
  }
  return inMemoryStore.quizAttempts
    .filter((a) => String(a.studentId) === String(studentId))
    .map((a) => {
      const quiz = inMemoryStore.quizzes.find((q) => String(q._id) === String(a.quizId));
      return { ...a, quizId: quiz || { subject: 'General' } };
    });
}

export async function submitFeedback({ studentId, subjectOrFacultyId, rating, comment, anonymized }) {
  if (!subjectOrFacultyId || !rating) throw new Error('Missing feedback parameters');
  const db = await connectToDatabase();
  if (db) {
    try {
      const fb = new Feedback({
        studentId: anonymized ? null : (isValidObjectId(studentId) ? studentId : null),
        subjectOrFacultyId,
        rating: Number(rating),
        comment: comment || '',
        anonymized: anonymized !== false,
      });
      return await fb.save();
    } catch (e) {
      console.error('DB error in submitFeedback:', e.message);
      throw e;
    }
  }
  const fb = {
    _id: '64f1a2b3c4d5e6f7a8b9c' + Math.floor(Math.random() * 8999 + 1000),
    studentId: anonymized ? null : studentId,
    subjectOrFacultyId,
    rating: Number(rating),
    comment: comment || '',
    anonymized: anonymized !== false,
    createdAt: new Date(),
  };
  inMemoryStore.feedback.push(fb);
  return fb;
}

export async function getAggregatedFeedback(subjectOrFacultyId) {
  const db = await connectToDatabase();
  let feedbackList = [];
  if (db) {
    try {
      const query = subjectOrFacultyId ? { subjectOrFacultyId } : {};
      feedbackList = await Feedback.find(query).lean();
    } catch (e) {
      console.error('DB error in getAggregatedFeedback:', e.message);
    }
  }
  if (!feedbackList.length) {
    feedbackList = inMemoryStore.feedback.filter(
      (f) => !subjectOrFacultyId || f.subjectOrFacultyId === subjectOrFacultyId
    );
  }

  const total = feedbackList.length;
  if (total === 0) {
    return { averageRating: 5.0, totalFeedback: 0, breakdown: [], recentComments: [] };
  }

  const sum = feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = Number((sum / total).toFixed(1));

  const breakdown = [1, 2, 3, 4, 5].map((star) => ({
    rating: star,
    count: feedbackList.filter((f) => f.rating === star).length,
  }));

  const recentComments = feedbackList
    .filter((f) => f.comment && f.comment.trim() !== '')
    .slice(-10)
    .map((f) => ({
      rating: f.rating,
      comment: f.comment,
      subjectOrFacultyId: f.subjectOrFacultyId,
      createdAt: f.createdAt,
    }));

  return { averageRating, totalFeedback: total, breakdown, recentComments };
}

export async function getStreak(studentId) {
  if (!studentId) return { currentStreak: 0, longestStreak: 0, badges: [] };
  const db = await connectToDatabase();
  if (db && isValidObjectId(studentId)) {
    try {
      const streak = await Streak.findOne({ studentId }).lean();
      if (streak) return streak;
    } catch (e) {
      console.error('DB error in getStreak:', e.message);
    }
  }
  const found = inMemoryStore.streaks.find((s) => String(s.studentId) === String(studentId));
  return found || { studentId, currentStreak: 12, longestStreak: 18, badges: ['Consistent Learner', 'Problem Solver'] };
}

export async function updateStreak(studentId, increment = true) {
  if (!studentId) return null;
  const db = await connectToDatabase();
  if (db && isValidObjectId(studentId)) {
    try {
      let streak = await Streak.findOne({ studentId });
      if (!streak) {
        streak = new Streak({
          studentId,
          currentStreak: 1,
          longestStreak: 1,
          badges: ['First Step Achiever'],
        });
      } else if (increment) {
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
        if (streak.currentStreak >= 7 && !streak.badges.includes('7-Day Spark')) {
          streak.badges.push('7-Day Spark');
        }
        if (streak.currentStreak >= 14 && !streak.badges.includes('14-Day Consistency Master')) {
          streak.badges.push('14-Day Consistency Master');
        }
      }
      streak.updatedAt = new Date();
      return await streak.save();
    } catch (e) {
      console.error('DB error in updateStreak:', e.message);
    }
  }
  let found = inMemoryStore.streaks.find((s) => String(s.studentId) === String(studentId));
  if (found) {
    found.currentStreak += 1;
    if (found.currentStreak > found.longestStreak) found.longestStreak = found.currentStreak;
  } else {
    found = {
      studentId,
      currentStreak: 1,
      longestStreak: 1,
      badges: ['First Step Achiever'],
      updatedAt: new Date(),
    };
    inMemoryStore.streaks.push(found);
  }
  return found;
}

export async function getStudentProfile(studentId) {
  const user = await getUser(studentId);
  if (!user) return null;

  const attendance = await getAttendanceByStudent(studentId);
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const totalClasses = attendance.length || 24;
  const overallPercentage = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 92;

  const quizAttempts = await getQuizAttemptsByStudent(studentId);
  const weakTopics = Array.from(new Set(quizAttempts.flatMap((q) => q.weakTopics || [])));
  const streak = await getStreak(studentId);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      classOrSubject: user.classOrSubject,
    },
    streak,
    attendance: {
      overallPercentage,
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      recent: attendance.slice(0, 7),
    },
    quizAttempts,
    weakTopics: weakTopics.length ? weakTopics : ['MOSFET Biasing', 'Propagation Delay in Logic Gates'],
  };
}

export async function getInstitutionAnalytics() {
  return {
    totalStudents: 480,
    totalFaculty: 32,
    averageAttendance: 91.4,
    averageQuizScore: 84.2,
    activeClassesCount: 6,
    activeClasses: [
      { id: '1', class: 'CSE-A', subject: 'Digital Electronics & VLSI', faculty: 'Dr. Priya Nair', present: 56, absent: 4, total: 60, attendancePercent: 93, status: 'Active' },
      { id: '2', class: 'CSE-B', subject: 'Data Structures & Algorithms', faculty: 'Prof. Rajesh Gupta', present: 48, absent: 12, total: 60, attendancePercent: 80, status: 'Active' },
      { id: '3', class: 'ECE-A', subject: 'Signals & Systems', faculty: 'Dr. Ananya Sen', present: 52, absent: 6, total: 58, attendancePercent: 89, status: 'Active' },
      { id: '4', class: 'IT-A', subject: 'Database Management Systems', faculty: 'Prof. Vikram Rao', present: 58, absent: 2, total: 60, attendancePercent: 96, status: 'Active' },
      { id: '5', class: 'AI-A', subject: 'Deep Learning & Neural Nets', faculty: 'Dr. Meera Iyer', present: 44, absent: 6, total: 50, attendancePercent: 88, status: 'Upcoming' },
      { id: '6', class: 'CSE-C', subject: 'Computer Networks', faculty: 'Prof. S. Verma', present: 55, absent: 5, total: 60, attendancePercent: 91, status: 'Completed' },
    ],
    attendanceTrends: [
      { date: 'Mon', attendance: 92 },
      { date: 'Tue', attendance: 94 },
      { date: 'Wed', attendance: 88 },
      { date: 'Thu', attendance: 91 },
      { date: 'Fri', attendance: 95 },
      { date: 'Sat', attendance: 89 },
      { date: 'Today', attendance: 91.4 },
    ],
    quizPerformance: [
      { subject: 'Digital Electronics', averageScore: 86, attemptsCount: 142 },
      { subject: 'Data Structures', averageScore: 78, attemptsCount: 198 },
      { subject: 'Signals & Systems', averageScore: 82, attemptsCount: 110 },
      { subject: 'DBMS', averageScore: 89, attemptsCount: 165 },
      { subject: 'Computer Networks', averageScore: 81, attemptsCount: 130 },
    ],
    streakLeaderboard: [
      { name: 'Aarav Sharma', streak: 14, badges: ['14-Day Consistency Master', 'VLSI Quiz Champion'], classOrSubject: 'CSE-A' },
      { name: 'Diya Patel', streak: 9, badges: ['7-Day Spark', 'DSA Prodigy'], classOrSubject: 'CSE-A' },
      { name: 'Aditya Mehta', streak: 8, badges: ['7-Day Spark'], classOrSubject: 'IT-A' },
      { name: 'Sanya Kapoor', streak: 7, badges: ['7-Day Spark'], classOrSubject: 'ECE-A' },
      { name: 'Rohan Verma', streak: 5, badges: ['Weekly Warrior'], classOrSubject: 'CSE-B' },
    ],
    feedbackStats: {
      averageRating: 4.8,
      totalFeedback: 342,
      breakdown: [
        { rating: 5, count: 240 },
        { rating: 4, count: 80 },
        { rating: 3, count: 18 },
        { rating: 2, count: 3 },
        { rating: 1, count: 1 },
      ],
    },
  };
}
