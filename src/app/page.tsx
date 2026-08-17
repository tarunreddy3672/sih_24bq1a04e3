'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  Camera,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import Hero3D from '@/components/landing/Hero3D';
import FeaturesGrid from '@/components/landing/FeaturesGrid';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 tech-grid-bg relative overflow-x-hidden">
      {/* Dynamic ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            EduVision<span className="text-cyan-400">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
            <span>SIH 2026 Engine Online</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-md shadow-cyan-500/10"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adaptive Institutional Learning OS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Education that <br />
              <span className="text-gradient">understands every</span> student.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed"
            >
              A unified neural ecosystem combining biometric attendance intelligence, personalized Claude AI study synthesis, real-time faculty telemetry, and an institutional command control tower.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 group transition-all"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Sign In with Role</span>
              </Link>
            </motion.div>

            {/* Micro Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10"
            >
              <div>
                <p className="text-xl font-bold text-white font-mono">99.2%</p>
                <p className="text-xs text-slate-400">Attendance Accuracy</p>
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-400 font-mono">&lt;100ms</p>
                <p className="text-xs text-slate-400">Claude AI Synthesis</p>
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-400 font-mono">Zero</p>
                <p className="text-xs text-slate-400">Client-Side Leakage</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Interactive Object */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full"
            >
              <Hero3D />
              <p className="text-center text-[11px] text-slate-500 font-mono mt-2">
                ⚡ Interactive 3D Educational Core — Drag to Orbit
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role Demonstration Fast-Launch Section */}
      <section className="py-12 bg-slate-950/60 border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              🚀 Direct Role Navigation for Hackathon Review
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any role to jump directly into the live authenticated workflow:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/student/dashboard"
              className="glass-panel p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Student Experience
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-medium">/student/dashboard</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personalized attendance rate, streak flames, Claude AI study plan, AI doubt chatbot, and MCQ test player.
              </p>
            </Link>

            <Link
              href="/faculty/attendance"
              className="glass-panel p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Faculty Biometric Console
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-medium">/faculty/attendance</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live facial detection, descriptor matching with enrolled embeddings, quiz authoring, and class analytics.
              </p>
            </Link>

            <Link
              href="/admin/control-tower"
              className="glass-panel p-5 rounded-2xl border border-amber-500/20 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Institutional Control Tower
                  </h3>
                  <span className="text-[11px] text-amber-400 font-medium">/admin/control-tower</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live class grid, dynamic AI WOW Insight card, attendance trends, streak leaderboards, and deep student profile drill-down.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Institutional Architecture Diagram Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold">
                01
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Face Telemetry</h4>
              <p className="text-xs text-slate-400">face-api.js descriptors matched against vector embeddings</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold">
                02
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Claude AI Synthesis</h4>
              <p className="text-xs text-slate-400">Weak topic extraction mapped to personalized revision schedules</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold">
                03
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Server Authorization</h4>
              <p className="text-xs text-slate-400">NextAuth JWT with role protection and zero browser trust</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold">
                04
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Control Tower AI</h4>
              <p className="text-xs text-slate-400">Institutional anomaly detection and proactive intervention triggers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-slate-950/80 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EduVision AI — Smart India Hackathon Architecture</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>MongoDB</span>
            <span>•</span>
            <span>Claude AI</span>
            <span>•</span>
            <span>face-api.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
