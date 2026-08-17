'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Users, Lock, Mail, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';

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
      color: 'text-indigo-600',
      activeStyle: 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20',
      redirect: '/student/dashboard',
      description: 'Streaks, quizzes & AI tutor',
    },
    {
      id: 'faculty' as const,
      label: 'Faculty Console',
      email: 'faculty@eduvision.ai',
      icon: Users,
      color: 'text-emerald-600',
      activeStyle: 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20',
      redirect: '/faculty/attendance',
      description: 'Face attendance & class analytics',
    },
    {
      id: 'admin' as const,
      label: 'Control Tower',
      email: 'admin@eduvision.ai',
      icon: ShieldCheck,
      color: 'text-amber-700',
      activeStyle: 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20',
      redirect: '/admin/control-tower',
      description: 'Campus-wide live analytics',
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
    <div className="min-h-screen bg-[#F8FAFC] study-grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        {/* Logo and title */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              EduVision
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Portal Access</h1>
          <p className="text-xs text-slate-500 mt-0.5">Smart India Hackathon 2026 Demonstration Build</p>
        </div>

        {/* Main Card */}
        <div className="study-card p-6 sm:p-8 border border-slate-200 shadow-lg bg-white relative">
          {/* Quick Role Selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 block">
              1-Click Demo Role Select
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
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? role.activeStyle
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${role.color}`} />
                      <span className="text-xs font-bold text-slate-900">
                        {role.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight block">
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
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Authorized Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                  placeholder="name@eduvision.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator inline-block" />
                NextAuth JWT Session Secured
              </span>
              <span className="font-mono text-slate-400">v2.4-SIH</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {quickRoles.find((r) => r.id === selectedRole)?.label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer details */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              ← Return to EduVision Overview
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
