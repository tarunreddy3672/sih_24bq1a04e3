'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Trash2,
  Save,
  Eye,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Modal from '@/components/shared/Modal';

interface QuizQuestionDraft {
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

export default function FacultyQuizCreatePage() {
  const [subject, setSubject] = useState('Digital Electronics');
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([
    {
      question: 'What is the effect of scaling down gate oxide thickness (Tox) in deep-submicron MOSFETs?',
      options: [
        'Increases transconductance and drain current',
        'Decreases gate capacitance',
        'Increases threshold voltage linearly',
        'Eliminates direct quantum tunneling gate leakage',
      ],
      correctAnswer: 0,
      topic: 'MOSFET Scaling',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        topic: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question: text } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx) {
          const newOpts = [...q.options];
          newOpts[optIdx] = val;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleCorrectAnswerChange = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswer: optIdx } : q))
    );
  };

  const handleTopicChange = (qIdx: number, topic: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, topic } : q))
    );
  };

  const handleSaveQuiz = async () => {
    setErrorMessage('');
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMessage(`Question ${i + 1} text cannot be blank.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setErrorMessage(`Question ${i + 1} must have all 4 options filled.`);
        return;
      }
      if (!q.topic.trim()) {
        setErrorMessage(`Question ${i + 1} must have an assigned topic tag.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          subject,
          questions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save quiz');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error saving quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Assessment Authoring Suite" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  MCQ Diagnostic Authoring System
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Create Timed Assessment
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Preview Quiz</span>
              </button>

              <button
                type="button"
                onClick={handleSaveQuiz}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish to Students'}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assessment published successfully to MongoDB! Students can now take this quiz.</span>
            </div>
          )}

          {/* Subject Meta Selection */}
          <div className="study-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quiz Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none"
                >
                  <option value="Digital Electronics">Digital Electronics & VLSI</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Signals & Systems">Signals & Systems</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Student Cohort
                </label>
                <input
                  type="text"
                  disabled
                  value="Section CSE-A (Enrolled: 60 Students)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Question Builder Cards */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="study-card p-6 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    QUESTION {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Question Stem
                  </label>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="Enter the conceptual question or derivation problem..."
                    className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    4 Multiple Choice Options (Select radio button for correct answer)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                            isCorrect ? 'border-emerald-300 bg-emerald-50/70 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-slate-500 w-4">
                            {String.fromCharCode(65 + optIdx)}:
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                            className="flex-1 bg-transparent text-xs text-slate-900 outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Topic Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Concept Tag (Used by AI for Diagnostic Weak-Topic Remediation)
                  </label>
                  <input
                    type="text"
                    value={q.topic}
                    onChange={(e) => handleTopicChange(qIdx, e.target.value)}
                    placeholder="e.g. MOSFET Biasing, CMOS Inverter Delay, Balanced BST"
                    className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add question button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3 rounded-2xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Another Question</span>
          </button>
        </main>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Quiz Preview: ${subject}`}
        subtitle={`${questions.length} Diagnostic Questions`}
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          {questions.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-900">
                {i + 1}. {q.question || '(Question text blank)'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-2 rounded-lg border text-[11px] ${
                      q.correctAnswer === optIdx
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}: {opt || '(Blank)'}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-indigo-700 font-mono">Topic Tag: {q.topic || 'Unassigned'}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
