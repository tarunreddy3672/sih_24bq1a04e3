'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Users, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('student@eduvision.ai');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickRoles = [
    {
      id: 'student' as const,
      label: 'Student Portal',
      email: 'student@eduvision.ai',
      icon: GraduationCap,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      redirect: '/student/dashboard',
      description: 'Streaks, quizzes, attendance & AI tutor',
    },
    {
      id: 'faculty' as const,
      label: 'Faculty Console',
      email: 'faculty@eduvision.ai',
      icon: Users,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      redirect: '/faculty/attendance',
      description: 'Face attendance, quiz builder & class analytics',
    },
    {
      id: 'admin' as const,
      label: 'Control Tower',
      email: 'admin@eduvision.ai',
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-red-500/10 border-amber-500/30 text-amber-400',
      redirect: '/admin/control-tower',
      description: 'Campus-wide live analytics & drill-down',
    },
  ];

  const handleRoleSelect = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    const found = quickRoles.find((r) => r.id === role);
    if (found) {
      setEmail(found.email);
      setPassword('password123');
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Navigate based on role selection or default
      const matched = quickRoles.find((r) => r.id === selectedRole);
      const destination = matched ? matched.redirect : '/student/dashboard';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] tech-grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10"
      >
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              EduVision<span className="text-cyan-400">.AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Portal Access</h1>
          <p className="text-sm text-slate-400 mt-1">Smart India Hackathon 2026 Demonstration Build</p>
        </div>

        {/* Main Glass Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
          {/* SIH Fast-Pass Role Selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              ⚡ Quick Demo Role Selection (1-Click Fill)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {quickRoles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `bg-slate-800/90 border-cyan-400/60 shadow-lg shadow-cyan-500/10`
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {role.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight block">
                      {role.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Authorized Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="name@eduvision.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Security Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator inline-block" />
                NextAuth JWT Session Secured
              </span>
              <span className="font-mono text-slate-500">v2.4-SIH</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter {quickRoles.find((r) => r.id === selectedRole)?.label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer details */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              ← Return to EduVision Landing Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
