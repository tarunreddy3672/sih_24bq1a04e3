import bcrypt from 'bcryptjs';

export const DEMO_USERS = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c001',
    name: 'Aarav Sharma',
    email: 'student@eduvision.ai',
    role: 'student',
    classOrSubject: 'CSE-A',
    password: 'password123',
    faceEmbedding: [0.12, -0.45, 0.78, 0.33, -0.19, 0.62, 0.44, -0.08, 0.15, 0.29],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c002',
    name: 'Diya Patel',
    email: 'diya@eduvision.ai',
    role: 'student',
    classOrSubject: 'CSE-A',
    password: 'password123',
    faceEmbedding: [0.22, -0.35, 0.68, 0.23, -0.29, 0.52, 0.34, -0.18, 0.25, 0.19],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c003',
    name: 'Rohan Verma',
    email: 'rohan@eduvision.ai',
    role: 'student',
    classOrSubject: 'CSE-B',
    password: 'password123',
    faceEmbedding: [0.18, -0.40, 0.72, 0.30, -0.22, 0.58, 0.40, -0.12, 0.19, 0.24],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c004',
    name: 'Dr. Priya Nair',
    email: 'faculty@eduvision.ai',
    role: 'faculty',
    classOrSubject: 'Digital Electronics & VLSI',
    password: 'password123',
    faceEmbedding: [],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c005',
    name: 'Prof. Rajesh Gupta',
    email: 'rajesh@eduvision.ai',
    role: 'faculty',
    classOrSubject: 'Data Structures & Algorithms',
    password: 'password123',
    faceEmbedding: [],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c006',
    name: 'Director S. K. Roy',
    email: 'admin@eduvision.ai',
    role: 'admin',
    classOrSubject: 'Dean Academic Operations',
    password: 'password123',
    faceEmbedding: [],
  },
];

export const DEMO_QUIZZES = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c101',
    subject: 'Digital Electronics',
    createdBy: '64f1a2b3c4d5e6f7a8b9c004',
    questions: [
      {
        question: 'Which semiconductor region is modulated by gate voltage in an enhancement MOSFET?',
        options: ['Inversion Layer Channel', 'Depletion Region Only', 'Drift Region', 'Substrate Body Contact'],
        correctAnswer: 0,
        topic: 'MOSFET',
      },
      {
        question: 'What is the propagation delay characteristic of a CMOS NOR gate compared to a NAND gate of equal size?',
        options: ['NAND is faster due to series NMOS and parallel PMOS', 'NOR is faster due to series PMOS', 'Both have identical delay', 'NOR has zero rise time'],
        correctAnswer: 0,
        topic: 'CMOS Logic',
      },
      {
        question: 'In a synchronous 4-bit up-counter using JK flip-flops, what is the toggle condition for flip-flop Q3?',
        options: ['Q0 AND Q1 AND Q2 = 1', 'Q0 OR Q1 = 1', 'CLK high only', 'Q2 = 1'],
        correctAnswer: 0,
        topic: 'Sequential Circuits',
      },
      {
        question: 'What is the primary factor limiting maximum clock frequency in pipelined digital circuits?',
        options: ['Setup time + propagation delay + clock skew', 'Hold time only', 'Dynamic power dissipation', 'Substrate noise'],
        correctAnswer: 0,
        topic: 'Timing Analysis',
      },
    ],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c102',
    subject: 'Data Structures & Algorithms',
    createdBy: '64f1a2b3c4d5e6f7a8b9c005',
    questions: [
      {
        question: 'What is the amortized time complexity of dynamic array push_back when capacity doubles?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswer: 0,
        topic: 'Amortized Analysis',
      },
      {
        question: 'In a Red-Black Tree, what is the maximum possible height for a tree with n internal nodes?',
        options: ['2 * log2(n + 1)', 'log2(n)', 'n / 2', '1.44 * log2(n)'],
        correctAnswer: 0,
        topic: 'Balanced Trees',
      },
      {
        question: 'Which algorithm is optimal for finding strongly connected components in directed graphs with O(V + E) complexity?',
        options: ['Tarjan’s or Kosaraju’s algorithm', 'Dijkstra with Fibonacci Heap', 'Bellman-Ford', 'Floyd-Warshall'],
        correctAnswer: 0,
        topic: 'Graph Algorithms',
      },
    ],
  },
];

export const DEMO_STREAKS = [
  {
    studentId: '64f1a2b3c4d5e6f7a8b9c001',
    currentStreak: 14,
    longestStreak: 21,
    badges: ['14-Day Consistency Master', 'VLSI Quiz Champion', 'Perfect Morning Attendance', 'AI Explorer'],
    updatedAt: new Date(),
  },
  {
    studentId: '64f1a2b3c4d5e6f7a8b9c002',
    currentStreak: 9,
    longestStreak: 15,
    badges: ['7-Day Spark', 'DSA Prodigy', 'Early Bird'],
    updatedAt: new Date(),
  },
  {
    studentId: '64f1a2b3c4d5e6f7a8b9c003',
    currentStreak: 5,
    longestStreak: 12,
    badges: ['Weekly Warrior', 'Quick Solver'],
    updatedAt: new Date(),
  },
];
