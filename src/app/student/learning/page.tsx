'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  BookOpen,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import LoadingState from '@/components/shared/LoadingState';

interface StudyPlanDay {
  day: number;
  title: string;
  duration: string;
  concepts: string[];
  actionItems: string[];
  recommendedResource: string;
}

interface StudyPlanData {
  summary: string;
  focusAreas: string[];
  days: StudyPlanDay[];
  estimatedScoreBoost: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function StudentLearningPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [weakTopics, setWeakTopics] = useState<{ topic: string; missedCount: number }[]>([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSource, setPlanSource] = useState('AI Adaptive Engine');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);

  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Explain Enhancement MOSFET channel inversion',
    'Why is CMOS NAND faster than NOR gate?',
    'What causes propagation delay in digital circuits?',
    'Derive Red-Black Tree maximum height bound',
  ];

  // Fetch student's assigned subjects
  useEffect(() => {
    const id = (session?.user as any)?.id;
    if (!id) return;
    fetch(`/api/students?studentId=${id}`)
      .then(r => r.json())
      .then(d => {
        const all = [...new Set([...(d.student?.subjects || []), ...(d.student?.labs || [])])];
        setSubjects(all);
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!selectedSubject) return;
    async function loadStudyPlan() {
      try {
        setPlanLoading(true);
        setStudyPlan(null);
        const res = await fetch(`/api/study-plan?subject=${encodeURIComponent(selectedSubject)}`);
        const data = await res.json();
        if (data.plan) {
          setStudyPlan(data.plan);
          setWeakTopics(data.weakTopics || []);
          if (data.source) setPlanSource(data.source);
        } else if (data.fallbackPlan) {
          setStudyPlan(data.fallbackPlan);
          setWeakTopics(data.weakTopics || []);
        }
      } catch (err) {
        console.error('Failed to load study plan:', err);
      } finally {
        setPlanLoading(false);
      }
    }
    loadStudyPlan();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || planLoading) return;
    const topics = weakTopics.length
      ? weakTopics.map((w) => w.topic).join(' and ')
      : studyPlan?.focusAreas?.slice(0, 2).join(' and ') || selectedSubject;
    const name = session?.user?.name?.split(' ')[0] || 'there';
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hello ${name}! I have generated your **${selectedSubject}** study plan. Your priority focus areas are **${topics}**. Ask me anything about this subject!`,
        timestamp: 'Just now',
      },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planLoading, selectedSubject]); // intentionally omit weakTopics/studyPlan — we only want this to fire once after loading completes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput('');
    setIsTyping(true);
    setChatError('');

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          currentTopic: selectedSubject || weakTopics[0]?.topic || 'General',
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (data.error) {
        setChatError(data.error);
      }
    } catch (err: any) {
      setChatError('Network error connecting to AI tutor. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. Ask me any question on your coursework or study plan!',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="AI Adaptive Learning & Tutor" roleBadge="STUDENT" />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT: AI Study Plan Generator */}
            <div className="lg:col-span-6 space-y-4">
              {/* Subject Selector */}
              <div className="study-card p-4 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Subject to Generate Plan</p>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-[13px] font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 cursor-pointer"
                  >
                    <option value="">Choose a subject…</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="study-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Adaptive Revision Schedule</h2>
                      <p className="text-xs text-slate-500">Derived from your quiz error patterns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {studyPlan && (
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Boost: {studyPlan.estimatedScoreBoost}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {planSource}
                    </span>
                  </div>
                </div>

                {!selectedSubject ? (
                  <p className="text-xs text-slate-400 text-center py-6">Select a subject above to generate your AI study plan.</p>
                ) : planLoading ? (
                  <LoadingState message="Synthesizing personalized revision schedule..." />
                ) : studyPlan ? (
                  <div className="space-y-4">
                    {/* Summary box */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                      <p className="font-semibold text-indigo-900 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600" /> AI Diagnostic Summary:
                      </p>
                      {studyPlan.summary}
                    </div>

                    {/* Focus Weak Topics */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Priority Mastery Concepts:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.map((w, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {w.topic}
                            <span className="text-[10px] text-rose-500 font-normal">({w.missedCount} misses)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Day-by-Day Schedule */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        3-Day Accelerated Remediation Schedule:
                      </p>
                      {studyPlan.days.map((day) => (
                        <div
                          key={day.day}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-700 font-mono">
                              DAY {day.day} • {day.title}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {day.duration}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {day.actionItems.map((act, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                            📚 Resource: {day.recommendedResource}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Unable to load adaptive plan.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Interactive AI Doubt Chatbot */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="study-card p-6 flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        EduVision AI Tutor
                        <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                      </h3>
                      <p className="text-[10px] text-slate-500">Gemini AI · Personalised Tutor</p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-slate-100 scrollbar-none">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-[11px] text-slate-600 hover:text-indigo-700 transition-all shrink-0 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                      )}

                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                        >
                          {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="[&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-xs [&_h3]:font-bold [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_li]:my-0.5 [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-indigo-700 [&_code]:text-[11px] [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100 [&_.katex]:text-sm [&_strong]:font-semibold">
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          <span className={`block text-[9px] mt-1.5 text-right font-mono ${
                            msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            {msg.timestamp}
                          </span>
                        </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-indigo-600 text-xs py-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <span className="font-medium text-[11px] animate-pulse">
                        Gemini AI synthesizing explanation...
                      </span>
                    </div>
                  )}

                  {chatError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="pt-3 border-t border-slate-100 shrink-0 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI tutor any question about your coursework..."
                    className="flex-1 bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
