'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Trash2, BookOpen, Clock, Users } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import LoadingState from '@/components/shared/LoadingState';

interface QuizItem {
  _id: string;
  subject: string;
  branch: string;
  section: string;
  questions: { _id: string }[];
  createdAt: string;
}

export default function FacultyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.quizzes) setQuizzes(data.quizzes);
    } catch { /* keep */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (quizId: string) => {
    if (!confirm('Delete this quiz? Students will no longer see it.')) return;
    setDeleting(quizId);
    setError('');
    try {
      const res = await fetch(`/api/quizzes?id=${quizId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizzes(prev => prev.filter(q => q._id !== quizId));
      } else {
        setError(data.error || 'Failed to delete quiz.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Quiz Management" roleBadge="FACULTY" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Quizzes</h1>
              <p className="text-xs text-slate-500 mt-1">Manage quizzes you have created. Students only see quizzes for their section.</p>
            </div>
            <Link href="/faculty/quizzes/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all">
              <PlusCircle className="w-4 h-4" /> Create New Quiz
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
          )}

          {loading ? (
            <LoadingState message="Loading quizzes..." />
          ) : quizzes.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No quizzes created yet.</p>
              <Link href="/faculty/quizzes/create" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline">
                <PlusCircle className="w-3.5 h-3.5" /> Create your first quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{quiz.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{quiz.branch}</span>
                        {quiz.section && <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{quiz.section}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      disabled={deleting === quiz._id}
                      className="shrink-0 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors disabled:opacity-50"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{quiz.questions?.length ?? 0} questions</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{quiz.section || 'All'}</span>
                    <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
