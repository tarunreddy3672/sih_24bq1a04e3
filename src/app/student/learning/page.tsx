'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  RotateCcw,
  Trash2,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Lightbulb,
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
  // Study Plan State
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [weakTopics, setWeakTopics] = useState<{ topic: string; missedCount: number }[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planSource, setPlanSource] = useState('AI Adaptive Engine');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello Aarav! I am your **EduVision AI Academic Tutor**. I have analyzed your recent quiz diagnostics on Digital Electronics and DSA. How can I help you master your weak topics today?",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const quickPrompts = [
    'Explain Enhancement MOSFET inversion layer and biasing',
    'Why is CMOS NAND gate faster than NOR gate?',
    'What causes propagation delay and clock skew?',
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
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="AI Adaptive Learning & Tutor Terminal" roleBadge="STUDENT" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 live-indicator" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Powered by Claude AI Sonnet & Diagnostic Telemetry
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Personalized Cognitive Acceleration Suite
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="md">
                Engine: {planSource}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: AI Study Plan Generator */}
            <div className="lg:col-span-6 space-y-4">
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Targeted Adaptive Study Plan</h2>
                      <p className="text-xs text-slate-400">Derived from your quiz error patterns</p>
                    </div>
                  </div>
                  {studyPlan && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Boost: {studyPlan.estimatedScoreBoost}
                    </span>
                  )}
                </div>

                {planLoading ? (
                  <LoadingState message="Synthesizing personalized revision schedule..." />
                ) : studyPlan ? (
                  <div className="space-y-4">
                    {/* Summary box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400" /> AI Diagnostic Summary:
                      </p>
                      {studyPlan.summary}
                    </div>

                    {/* Focus Weak Topics */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        🚨 Priority Mastery Targets:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.map((w, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {w.topic}
                            <span className="text-[10px] text-red-400/80">({w.missedCount} misses)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Day-by-Day Schedule */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        📅 3-Day Accelerated Remediation Path:
                      </p>
                      {studyPlan.days.map((day) => (
                        <div
                          key={day.day}
                          className="p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-400 font-mono">
                              DAY {day.day} • {day.title}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {day.duration}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {day.actionItems.map((act, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-white/5">
                            📚 Source: {day.recommendedResource}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Unable to load adaptive plan.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Interactive AI Doubt Chatbot */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col h-[650px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        EduVision AI Tutor
                        <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
                      </h3>
                      <p className="text-[10px] text-slate-400">Server-Side Claude Sonnet Integration</p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Prompts Carousel */}
                <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-white/5 scrollbar-none">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-all shrink-0 whitespace-nowrap"
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
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                            : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-bl-none prose prose-invert max-w-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <span className="block text-[9px] text-slate-400 mt-1.5 text-right font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <span className="font-mono text-[11px] animate-pulse">
                        Claude Sonnet synthesizing response...
                      </span>
                    </div>
                  )}

                  {chatError && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
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
                  className="pt-3 border-t border-white/10 shrink-0 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI tutor anything about your coursework..."
                    className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
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
