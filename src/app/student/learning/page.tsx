'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Badge from '@/components/shared/Badge';
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
  const [planLoading, setPlanLoading] = useState(true);
  const [planSource, setPlanSource] = useState('AI Adaptive Engine');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello Aarav! I am your **EduVision AI Academic Tutor**. I have analyzed your recent diagnostic quizzes on Digital Electronics and Data Structures. What concepts would you like to review today?",
      timestamp: 'Just now',
    },
  ]);
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

  useEffect(() => {
    async function loadStudyPlan() {
      try {
        setPlanLoading(true);
        const res = await fetch('/api/study-plan');
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
  }, []);

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
          currentTopic: weakTopics[0]?.topic || 'Digital Electronics',
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Powered by Claude AI & Diagnostic Telemetry
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Personalized Study & Doubt Clearing Hub
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="md">
                Engine: {planSource}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: AI Study Plan Generator */}
            <div className="lg:col-span-6 space-y-4">
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
                  {studyPlan && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Estimated Boost: {studyPlan.estimatedScoreBoost}
                    </span>
                  )}
                </div>

                {planLoading ? (
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
              <div className="study-card p-6 flex flex-col h-[650px]">
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
                      <p className="text-[10px] text-slate-500">Academic Claude AI Integration</p>
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

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none prose prose-slate max-w-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <span className={`block text-[9px] mt-1.5 text-right font-mono ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
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
                        Claude AI synthesizing academic explanation...
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
