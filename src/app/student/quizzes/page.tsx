'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Flame,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import LoadingState from '@/components/shared/LoadingState';

interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  topic: string;
}

interface QuizItem {
  _id: string;
  subject: string;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  weakTopics: string[];
  breakdown: {
    question: string;
    topic: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch('/api/quizzes');
        const data = await res.json();
        if (data.quizzes) {
          setQuizzes(data.quizzes);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizActive && timeLeft > 0 && !quizResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, timeLeft, quizResult]);

  const handleStartQuiz = (quiz: QuizItem) => {
    setSelectedQuiz(quiz);
    setActiveQuestionIdx(0);
    setSelectedAnswers({});
    setTimeLeft(quiz.questions.length * 90); // 90 seconds per question
    setIsQuizActive(true);
    setQuizResult(null);
  };

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestionIdx]: optionIdx,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const answersArray = selectedQuiz.questions.map((_, i) =>
        selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1
      );

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          quizId: selectedQuiz._id,
          selectedAnswers: answersArray,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setQuizResult(data.result);
        setIsQuizActive(false);
        if (data.result.score >= 75) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Adaptive Assessment Engine" roleBadge="STUDENT" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Timed Diagnostic & MCQ Evaluations
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Zero client-side leakage • Server-side verification & automatic streak tracking
              </p>
            </div>

            {isQuizActive && (
              <div className={`px-4 py-2 rounded-xl font-mono text-sm font-bold flex items-center gap-2 border ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-slate-900 text-cyan-400 border-cyan-500/30'
              }`}>
                <Clock className="w-4 h-4" />
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {loading ? (
            <LoadingState message="Fetching active question banks..." />
          ) : !isQuizActive && !quizResult ? (
            /* QUIZ SELECTION LIST */
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Available Assessments for CSE-A
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="cyan" size="md">
                          {quiz.subject}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">
                          {quiz.questions.length} MCQs
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{quiz.subject} Diagnostic</h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Timed evaluation on core theoretical derivations, timing delays, and numerical concepts.
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Begin Timed Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : isQuizActive && selectedQuiz ? (
            /* ACTIVE QUIZ PLAYER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Question card */}
              <div className="lg:col-span-8 space-y-4">
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      QUESTION {activeQuestionIdx + 1} OF {selectedQuiz.questions.length}
                    </span>
                    <Badge variant="indigo" size="sm">
                      Topic: {selectedQuiz.questions[activeQuestionIdx].topic}
                    </Badge>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-white mb-6 leading-relaxed">
                    {selectedQuiz.questions[activeQuestionIdx].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {selectedQuiz.questions[activeQuestionIdx].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[activeQuestionIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                              isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                    <button
                      type="button"
                      disabled={activeQuestionIdx === 0}
                      onClick={() => setActiveQuestionIdx((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-300"
                    >
                      ← Previous
                    </button>

                    {activeQuestionIdx < selectedQuiz.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1.5"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Palette / Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Question Palette
                  </h4>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {selectedQuiz.questions.map((_, idx) => {
                      const isAnswered = selectedAnswers[idx] !== undefined;
                      const isCurrent = activeQuestionIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveQuestionIdx(idx)}
                          className={`h-10 rounded-xl font-mono text-xs font-bold border transition-all ${
                            isCurrent
                              ? 'border-cyan-400 bg-cyan-500/30 text-white'
                              : isAnswered
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span>Answered:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Object.keys(selectedAnswers).length} / {selectedQuiz.questions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unanswered:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {selectedQuiz.questions.length - Object.keys(selectedAnswers).length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full mt-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
                  >
                    Finish & Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* QUIZ RESULT SCREEN */
            quizResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                <div className="glass-panel-glow p-8 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto">
                    <Award className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Assessment Complete</h2>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono">
                    {quizResult.score}%
                  </div>
                  <p className="text-xs text-slate-300">
                    You answered <span className="text-emerald-400 font-bold">{quizResult.correctCount}</span> of{' '}
                    <span className="font-bold">{quizResult.totalQuestions}</span> questions correctly.
                  </p>

                  {/* Weak topics prompt */}
                  {quizResult.weakTopics.length > 0 && (
                    <div className="pt-4 max-w-md mx-auto">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2">
                        🔍 Remediation Needed on Weak Topics:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {quizResult.weakTopics.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setIsQuizActive(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Return to Quiz Catalog
                    </button>
                    <a
                      href="/student/learning"
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Generate AI Study Plan for Weak Topics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Question-by-Question Breakdown */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-base font-bold text-white">Diagnostic Verification Breakdown</h3>
                  <div className="space-y-3">
                    {quizResult.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-xs ${
                          item.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-red-950/20 border-red-500/30 text-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-white">
                            {idx + 1}. {item.question}
                          </p>
                          {item.isCorrect ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 font-bold shrink-0">
                              <XCircle className="w-4 h-4" /> Missed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Topic: <span className="text-slate-300">{item.topic}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Assessment?"
        subtitle="Your answers will be calculated server-side and recorded to your telemetry profile."
      >
        <p className="text-xs text-slate-300 mb-6">
          Are you sure you want to finish? You have answered{' '}
          <strong className="text-cyan-400">{Object.keys(selectedAnswers).length}</strong> of{' '}
          <strong>{selectedQuiz?.questions.length}</strong> questions.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
          >
            Continue Test
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            {isSubmitting ? 'Verifying...' : 'Yes, Submit Now'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
