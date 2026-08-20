'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, GraduationCap, Users, Lock, Mail,
  ArrowRight, AlertCircle, Sparkles, Zap,
  KeyRound, RefreshCw, CheckCircle2, BookOpen,
  BarChart3, Brain, Camera,
} from 'lucide-react';

const quickRoles = [
  { id: 'student', label: 'Student Portal',  email: 'student@eduvision.ai', icon: GraduationCap,
    active: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-200',
    inactive: 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md',
    iconBg: 'bg-white/20', iconColor: 'text-white',
    redirect: '/student/dashboard', desc: 'Streaks, quizzes & AI tutor' },
  { id: 'faculty', label: 'Faculty Console', email: 'faculty@eduvision.ai', icon: Users,
    active: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-200',
    inactive: 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md',
    iconBg: 'bg-white/20', iconColor: 'text-white',
    redirect: '/faculty/attendance', desc: 'Face attendance & analytics' },
  { id: 'admin', label: 'Control Tower', email: 'admin@eduvision.ai', icon: ShieldCheck,
    active: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-200',
    inactive: 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:shadow-md',
    iconBg: 'bg-white/20', iconColor: 'text-white',
    redirect: '/admin/control-tower', desc: 'Campus-wide live analytics' },
];

const ROLE_REDIRECTS: Record<string, string> = {
  student: '/student/dashboard',
  faculty: '/faculty/attendance',
  admin: '/admin/control-tower',
};

const features = [
  { icon: Camera,   label: 'Real-Time Face Attendance',  desc: 'AI-powered biometric verification' },
  { icon: Brain,    label: 'Gemini AI Tutor',            desc: 'Personalised study plans & chat' },
  { icon: BarChart3,label: 'Live Analytics Dashboard',   desc: 'Campus-wide insights at a glance' },
  { icon: BookOpen, label: 'Smart Quiz Engine',          desc: 'Adaptive assessments & streaks' },
];

type LoginTab = 'password' | 'otp';
type OtpStep  = 'email' | 'code';

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab]                       = useState<LoginTab>('password');
  const [email, setEmail]                   = useState('student@eduvision.ai');
  const [password, setPassword]             = useState('password123');
  const [selectedRole, setSelectedRole]     = useState<'student' | 'faculty' | 'admin'>('student');
  const [pwLoading, setPwLoading]           = useState(false);
  const [pwError, setPwError]               = useState('');

  const [otpEmail, setOtpEmail]             = useState('');
  const [otpStep, setOtpStep]               = useState<OtpStep>('email');
  const [otpDigits, setOtpDigits]           = useState(['', '', '', '', '', '']);
  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRef4 = useRef<HTMLInputElement>(null);
  const otpRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];
  const [otpLoading, setOtpLoading]         = useState(false);
  const [otpError, setOtpError]             = useState('');
  const [otpPreview, setOtpPreview]         = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleRoleSelect = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    const found = quickRoles.find(r => r.id === role);
    if (found) { setEmail(found.email); setPassword('password123'); setPwError(''); }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true); setPwError('');
    try {
      const res = await signIn('credentials', { redirect: false, email, password });
      if (res?.error) { setPwError('Invalid credentials. Please try again.'); return; }
      // Poll session until role is populated from the JWT (up to 3 attempts)
      let actualRole = 'student';
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 300));
        const s = await fetch('/api/auth/session').then(r => r.json()).catch(() => null);
        if (s?.user?.role) { actualRole = s.user.role; break; }
      }
      router.push(ROLE_REDIRECTS[actualRole] || '/student/dashboard');
      router.refresh();
    } catch (err: any) {
      setPwError(err?.message || 'An unexpected error occurred.');
    } finally { setPwLoading(false); }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(''); setOtpLoading(true);
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim(), purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || 'Failed to send OTP.'); return; }
      if (data.preview) setOtpPreview(data.preview);
      setOtpStep('code'); setResendCooldown(60);
    } catch { setOtpError('Network error.'); }
    finally { setOtpLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otpDigits]; next[i] = digit; setOtpDigits(next);
    if (digit && i < 5) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs[i - 1].current?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 6) { setOtpDigits(digits); otpRefs[5].current?.focus(); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) { setOtpError('Enter the complete 6-digit code.'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const vRes  = await fetch('/api/otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim(), otp, purpose: 'login' }),
      });
      const vData = await vRes.json();
      if (!vRes.ok) { setOtpError(vData.error || 'Verification failed.'); return; }
      const res = await signIn('credentials', {
        redirect: false, email: otpEmail.trim(), password: 'OTP_VERIFIED_' + otp,
      });
      const userRole = vData.user?.role || 'student';
      router.push(ROLE_REDIRECTS[userRole] || '/student/dashboard');
      router.refresh();
    } catch { setOtpError('Network error.'); }
    finally { setOtpLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError(''); setOtpDigits(['','','','','','']); setOtpLoading(true);
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim(), purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || 'Failed to resend.'); return; }
      if (data.preview) setOtpPreview(data.preview);
      setResendCooldown(60);
    } catch { setOtpError('Network error.'); }
    finally { setOtpLoading(false); }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT HERO PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)' }}>

        {/* Animated orbs */}
        <motion.div animate={{ scale:[1,1.2,1], opacity:[0.3,0.5,0.3] }} transition={{ duration:6, repeat:Infinity }}
          className="absolute w-96 h-96 rounded-full top-[-80px] right-[-80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <motion.div animate={{ scale:[1,1.15,1], opacity:[0.2,0.4,0.2] }} transition={{ duration:8, repeat:Infinity, delay:2 }}
          className="absolute w-80 h-80 rounded-full bottom-[-60px] left-[-60px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Top logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight block">EduVision</span>
              <span className="text-xs text-indigo-300 font-mono">Academic OS v2.4</span>
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.h2 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="text-4xl font-bold text-white leading-tight mb-3">
              Smart India<br />Hackathon 2026
            </motion.h2>
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="text-indigo-200 text-base leading-relaxed max-w-sm">
              AI-powered academic platform with real-time face attendance, personalised learning, and campus analytics.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div key={label} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/8 backdrop-blur border border-white/10 hover:bg-white/12 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-indigo-300">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
            18 sections · 480+ students · Live since 2026
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-slate-50 overflow-y-auto">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">EduVision</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your institutional portal</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-white border border-slate-200 p-1.5 mb-8 gap-1.5 shadow-sm">
            {(['password', 'otp'] as LoginTab[]).map(t => (
              <button key={t} type="button"
                onClick={() => { setTab(t); setPwError(''); setOtpError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                {t === 'password' ? '🔑  Password' : '📧  Email OTP'}
              </button>
            ))}
          </div>

          {/* ── PASSWORD TAB ── */}
          {tab === 'password' && (
            <motion.div key="pw" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>

              {/* Role selector */}
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" /> Quick Demo Access
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {quickRoles.map(role => {
                    const Icon     = role.icon;
                    const isActive = selectedRole === role.id;
                    return (
                      <motion.button key={role.id} type="button"
                        onClick={() => handleRoleSelect(role.id as any)}
                        whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${isActive ? role.active : role.inactive}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${isActive ? role.iconBg : 'bg-slate-100'}`}>
                          <Icon className={`w-4.5 h-4.5 ${isActive ? role.iconColor : 'text-slate-400'} w-5 h-5`} />
                        </div>
                        <span className={`text-sm font-bold block leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{role.label}</span>
                        <span className={`text-[11px] leading-tight block mt-1 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{role.desc}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {pwError && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /><span>{pwError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3.5 w-5 h-5" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
                      placeholder="name@eduvision.ai" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
                      placeholder="••••••••••••" />
                  </div>
                </div>
                <motion.button type="submit" disabled={pwLoading}
                  whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-lg shadow-indigo-200 text-sm transition-all">
                  {pwLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Sparkles className="w-4 h-4" /><span>Sign In to Portal</span><ArrowRight className="w-4 h-4" /></>
                  }
                </motion.button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-400">
                Demo password: <code className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 font-mono">password123</code>
              </p>
            </motion.div>
          )}

          {/* ── OTP TAB ── */}
          {tab === 'otp' && (
            <motion.div key="otp" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
              <AnimatePresence>
                {otpError && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /><span>{otpError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {otpPreview && otpStep === 'code' && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <p className="font-semibold mb-1">🔧 Dev mode — OTP code:</p>
                  <p className="font-mono text-2xl tracking-[0.3em] font-bold text-amber-900">{otpPreview.replace('OTP logged to console: ', '')}</p>
                  <p className="text-xs mt-1 text-amber-600">Enter this code in the boxes below</p>
                </div>
              )}

              {otpStep === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">Sign in with OTP</p>
                    <p className="text-sm text-slate-500 mt-1">We'll send a 6-digit code to your registered email</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                      <input type="email" required value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
                        placeholder="you@college.edu" />
                    </div>
                  </div>
                  <motion.button type="submit" disabled={otpLoading}
                    whileHover={{ scale:1.01, y:-1 }} whileTap={{ scale:0.99 }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-lg shadow-indigo-200 text-sm">
                    {otpLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><KeyRound className="w-4 h-4" /><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="text-center py-2">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">Enter verification code</p>
                    <p className="text-sm text-slate-500 mt-1">Sent to <strong className="text-slate-700">{otpEmail}</strong></p>
                  </div>

                  <div className="flex items-center justify-center gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all ${
                          d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-900'
                        } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10`}
                      />
                    ))}
                  </div>

                  <motion.button type="submit" disabled={otpLoading || otpDigits.join('').length < 6}
                    whileHover={{ scale:1.01, y:-1 }} whileTap={{ scale:0.99 }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-lg shadow-indigo-200 text-sm">
                    {otpLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><CheckCircle2 className="w-4 h-4" /><span>Verify & Sign In</span></>
                    }
                  </motion.button>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <button type="button" onClick={() => { setOtpStep('email'); setOtpError(''); setOtpDigits(['','','','','','']); }}
                      className="hover:text-indigo-600 transition-colors font-medium">← Change email</button>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || otpLoading}
                      className="flex items-center gap-1.5 hover:text-indigo-600 disabled:opacity-40 transition-colors font-medium">
                      <RefreshCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-sm">
            <p className="text-slate-500">
              No account?{' '}
              <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Create one →</Link>
            </p>
            <Link href="/" className="text-slate-400 hover:text-indigo-600 transition-colors">← Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
