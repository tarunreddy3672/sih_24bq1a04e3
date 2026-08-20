'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  motion, useScroll, useTransform, useSpring, useInView,
} from 'framer-motion';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import ArrowRight    from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck   from 'lucide-react/dist/esm/icons/shield-check';
import Camera        from 'lucide-react/dist/esm/icons/camera';
import Lock          from 'lucide-react/dist/esm/icons/lock';
import Sparkles      from 'lucide-react/dist/esm/icons/sparkles';
import Zap           from 'lucide-react/dist/esm/icons/zap';
import Star          from 'lucide-react/dist/esm/icons/star';
import TrendingUp    from 'lucide-react/dist/esm/icons/trending-up';
import Brain         from 'lucide-react/dist/esm/icons/brain';
import Users         from 'lucide-react/dist/esm/icons/users';
import Award         from 'lucide-react/dist/esm/icons/award';
import ChevronRight  from 'lucide-react/dist/esm/icons/chevron-right';
import Check         from 'lucide-react/dist/esm/icons/check';
import Phone         from 'lucide-react/dist/esm/icons/phone';
import Mail          from 'lucide-react/dist/esm/icons/mail';
import MapPin        from 'lucide-react/dist/esm/icons/map-pin';
import Globe         from 'lucide-react/dist/esm/icons/globe';
import HelpCircle    from 'lucide-react/dist/esm/icons/help-circle';
import Rocket        from 'lucide-react/dist/esm/icons/rocket';
import Menu          from 'lucide-react/dist/esm/icons/menu';
import X             from 'lucide-react/dist/esm/icons/x';
import Share2        from 'lucide-react/dist/esm/icons/share-2';
import Globe2        from 'lucide-react/dist/esm/icons/globe-2';
import Send          from 'lucide-react/dist/esm/icons/send';
import Rss           from 'lucide-react/dist/esm/icons/rss';
import Hero3D from '@/components/landing/Hero3D';
import FeaturesGrid from '@/components/landing/FeaturesGrid';

/* ── Floating ambient orb ── */
function Orb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

/* ── Typewriter hook ── */
function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const t = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref} className="count-pop inline-block">
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Role card ── */
function RoleCard({ href, icon: Icon, title, route, desc, color, gradient, delay }: {
  href: string; icon: React.FC<{ className?: string }>; title: string; route: string;
  desc: string; color: string; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="h-full"
    >
      <Link href={href} className="study-card card-shine p-8 flex flex-col gap-5 block group relative overflow-hidden h-full">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.25rem] ${gradient}`} />
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${color.replace('text-', 'bg-').replace('600', '100')} border-2 ${color.replace('text-', 'border-').replace('600', '200')} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800">{title}</h3>
            <span className={`text-sm font-mono ${color}`}>{route}</span>
          </div>
        </div>
        <p className="text-base text-slate-600 leading-relaxed relative z-10">{desc}</p>
        <div className={`flex items-center gap-2 text-base font-bold ${color} relative z-10 mt-2`}>
          Enter Portal <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Testimonial card ── */
function TestimonialCard({ quote, name, role, avatar, delay }: {
  quote: string; name: string; role: string; avatar: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55 }}
      whileHover={{ y: -8 }}
      className="study-card card-shine p-8 flex flex-col gap-5"
    >
      <div className="flex gap-1.5">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
      </div>
      <p className="text-lg text-slate-700 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 flex items-center justify-center text-white font-bold text-xl">
          {avatar}
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Architecture step ── */
function ArchStep({ num, title, desc, icon: Icon, color, delay }: {
  num: string; title: string; desc: string; icon: React.FC<{ className?: string }>; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="study-card card-shine p-7 text-center flex flex-col items-center gap-4 group"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '50')} border-2 ${color.replace('text-', 'border-').replace('600', '200')} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${color.replace('text-', 'bg-').replace('600', '50')} ${color} border ${color.replace('text-', 'border-').replace('600', '200')}`}>{num}</div>
      <h4 className="text-lg font-bold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </motion.div>
  );
}

/* ── FAQ item ── */
function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="study-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-lg font-bold text-slate-900">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-xl font-bold">+</span>
          </div>
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-base text-slate-600 leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

/* ── Pricing card ── */
function PricingCard({ name, price, period, features, popular, delay }: {
  name: string; price: string; period: string; features: string[]; popular?: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55 }}
      whileHover={{ y: -10 }}
      className={`relative rounded-3xl p-8 flex flex-col gap-6 ${popular ? 'gradient-border-card bg-white shadow-2xl' : 'study-card'}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg">
          Most Popular
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <div className="flex items-end gap-1 mt-3">
          <span className="text-5xl font-extrabold text-slate-900">{price}</span>
          <span className="text-base text-slate-500 mb-1.5">/{period}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-base text-slate-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-auto">
        <Link
          href="/register"
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            popular
              ? 'btn-gradient text-white'
              : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

const techStack = [
  'Next.js 16', 'React 19', 'TypeScript', 'MongoDB', 'NextAuth v4',
  'face-api.js', 'Gemini AI', 'Tailwind v4', 'Framer Motion', 'Three.js',
  'Recharts', 'Mongoose', 'Vercel Edge', 'WebRTC', 'JWT Auth',
  'Next.js 16', 'React 19', 'TypeScript', 'MongoDB', 'NextAuth v4',
  'face-api.js', 'Gemini AI', 'Tailwind v4', 'Framer Motion', 'Three.js',
  'Recharts', 'Mongoose', 'Vercel Edge', 'WebRTC', 'JWT Auth',
];

const faqs = [
  {
    q: 'How does biometric attendance work?',
    a: 'Our system uses face-api.js to generate facial descriptors directly in the browser. These are matched against enrolled embeddings in real-time — no photos are ever stored on servers, ensuring complete privacy.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. All authentication uses NextAuth JWT with role-based protection. Biometric data never leaves the browser, and all other data is encrypted in transit and at rest.',
  },
  {
    q: 'How does the AI study plan work?',
    a: 'Gemini AI analyzes your quiz performance to identify weak topics, then generates a personalized revision schedule with micro-lessons and practice questions tailored to your learning pace.',
  },
  {
    q: 'Can I use it on mobile?',
    a: 'Yes! EduVision is fully responsive and works seamlessly on any device — from smartphones to tablets to desktop workstations.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most institutions are fully onboarded within 48 hours. Our team handles data migration, faculty training, and student enrollment to ensure a smooth transition.',
  },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yParallax  = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacityOut = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const springY    = useSpring(yParallax, { stiffness: 80, damping: 20 });
  const [mobileMenu, setMobileMenu] = useState(false);

  const typeText = useTypewriter([
    'every student.',
    'every classroom.',
    'every institution.',
    'the future.',
  ]);

  return (
    <div className="min-h-screen mesh-bg text-slate-800 relative overflow-x-hidden">
      {/* Ambient orbs */}
      <Orb className="w-[700px] h-[700px] bg-indigo-400/10 top-[-250px] left-[-250px] orb-animate" />
      <Orb className="w-[500px] h-[500px] bg-sky-400/8 top-[200px] right-[-150px] orb-animate-slow" />
      <Orb className="w-[400px] h-[400px] bg-purple-400/6 bottom-[400px] left-[30%] orb-animate" />
      <Orb className="w-[300px] h-[300px] bg-emerald-400/6 bottom-[100px] right-[10%] orb-animate-slow" />

      {/* ── Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between relative z-30"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center glow-indigo text-white"
          >
            <GraduationCap className="w-7 h-7" />
          </motion.div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">EduVision</span>
            <span className="text-sm text-slate-400 block -mt-0.5 font-mono">Academic OS v2.4</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Testimonials', href: '#testimonials' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-indicator" />
            <span>Live Now</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl btn-gradient text-white font-bold text-base flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch Portal</span>
            </Link>
          </motion.div>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="lg:hidden w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      {mobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed inset-x-0 top-24 z-40 mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6"
        >
          <div className="flex flex-col gap-4">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenu(false)}
                className="text-lg font-semibold text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 py-3 rounded-xl btn-gradient text-white font-bold text-base text-center"
            >
              Launch Portal
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Hero ── */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left copy */}
          <motion.div style={{ y: springY, opacity: opacityOut }} className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-base font-bold text-indigo-700"
            >
              <Zap className="w-5 h-5 fill-indigo-500 text-indigo-500" />
              Smart Education Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900"
            >
              Education that <br />
              <span className="text-gradient-academic">understands{' '}</span>
              <span className="text-gradient-academic">{typeText}</span>
              <span className="cursor-blink text-indigo-500 ml-1">|</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-slate-600 max-w-2xl leading-relaxed"
            >
              Biometric attendance, AI study plans, and real-time analytics — all in one beautiful platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl btn-gradient text-white font-bold text-lg flex items-center gap-3 group"
                >
                  Explore Platform
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ArrowRight className="w-6 h-6" />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-bold text-lg flex items-center gap-3 transition-colors shadow-sm"
                >
                  <Lock className="w-6 h-6 text-slate-500" />
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-slate-200"
            >
              <div>
                <p className="text-4xl font-extrabold font-mono text-slate-900"><Counter target={99} suffix=".2%" /></p>
                <p className="text-base text-slate-500 mt-1">Biometric Accuracy</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold font-mono text-indigo-600">{'<100ms'}</p>
                <p className="text-base text-slate-500 mt-1">AI Diagnostic Speed</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold font-mono text-emerald-600">Zero</p>
                <p className="text-base text-slate-500 mt-1">Answer Leakage</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right 3D */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <Hero3D />
              <p className="text-center text-sm text-slate-500 mt-3">
                Interactive Academic Core — Click & Drag to Rotate
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Marquee ── */}
      <div className="py-6 border-y-2 border-slate-200 bg-white/70 backdrop-blur-sm overflow-hidden relative z-10">
        <div className="flex gap-0 marquee-track whitespace-nowrap">
          {techStack.map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 px-6 text-base font-bold text-slate-500 shrink-0">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── Role Navigation ── */}
      <section className="py-20 relative z-10 border-b-2 border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-base font-bold text-indigo-700 mb-4">
              <Users className="w-5 h-5" />
              Three Powerful Portals
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Choose Your Role</h2>
            <p className="text-lg text-slate-500 mt-3">Jump straight into your workspace</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard href="/student/dashboard"   icon={GraduationCap} title="Student"          route="/student/dashboard"  color="text-indigo-600"  gradient="bg-gradient-to-br from-indigo-50/80 to-violet-50/80" delay={0}   desc="AI study plans, streak tracking, and smart quizzes." />
            <RoleCard href="/faculty/attendance"  icon={Camera}        title="Faculty"          route="/faculty/attendance" color="text-emerald-600" gradient="bg-gradient-to-br from-emerald-50/80 to-teal-50/80"   delay={0.1} desc="Facial attendance, quiz creation, and class analytics." />
            <RoleCard href="/admin/control-tower" icon={ShieldCheck}   title="Administrator"    route="/admin/control-tower" color="text-amber-600"   gradient="bg-gradient-to-br from-amber-50/80 to-orange-50/80"   delay={0.2} desc="Live class grid, trends, and AI advisory insights." />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <div id="features">
        <FeaturesGrid />
      </div>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-slate-200 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-base font-bold text-slate-600 mb-4">
            <Brain className="w-5 h-5" />
            Under the Hood
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">How It Works</h2>
          <p className="text-lg text-slate-500 mt-3">Four pillars powering the platform</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ArchStep num="01" icon={Camera}      color="text-indigo-600"  title="Face Telemetry"       desc="Real-time facial recognition"                    delay={0} />
          <ArchStep num="02" icon={Brain}       color="text-violet-600"  title="AI Study Synthesis"   desc="Personalized revision plans"                    delay={0.1} />
          <ArchStep num="03" icon={Lock}        color="text-emerald-600" title="Server Authorization" desc="JWT with role protection"                       delay={0.2} />
          <ArchStep num="04" icon={TrendingUp}  color="text-amber-600"   title="Control Tower AI"     desc="Anomaly detection & alerts"                     delay={0.3} />
        </div>
      </section>

      {/* ── Stats Banner — hidden in demo mode ── */}
      {false && (
      <section className="py-16 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #0EA5E9 100%)' }}
          >
            <Orb className="w-64 h-64 bg-white/10 -top-16 -left-16" />
            <Orb className="w-48 h-48 bg-white/10 -bottom-12 -right-12" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-extrabold text-white"><Counter target={50} suffix="+" /></p>
                <p className="text-lg text-white/80 mt-2">Institutions</p>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white"><Counter target={10000} suffix="+" /></p>
                <p className="text-lg text-white/80 mt-2">Active Students</p>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white"><Counter target={98} suffix="%" /></p>
                <p className="text-lg text-white/80 mt-2">Satisfaction Rate</p>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white"><Counter target={24} suffix="/7" /></p>
                <p className="text-lg text-white/80 mt-2">Support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 border-t-2 border-slate-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 border border-amber-200 text-base font-bold text-amber-700 mb-4">
              <Award className="w-5 h-5" />
              Trusted by Educators
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">What People Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard quote="Biometric attendance cut our roll-call time by 90%. Students love the streak system!" name="Dr. Priya Nair" role="Faculty, Digital Electronics" avatar="P" delay={0} />
            <TestimonialCard quote="The AI study plan found my weak topics in minutes. My scores jumped from 72% to 91%!" name="Aarav Sharma" role="B.Tech CSE · Semester 5" avatar="A" delay={0.1} />
            <TestimonialCard quote="The Control Tower gives me a real-time pulse of every classroom. Game changer!" name="Prof. Vikram Rao" role="HOD, Computer Science" avatar="V" delay={0.2} />
          </div>
        </div>
      </section>

      {/* ── Pricing — hidden in demo mode ── */}
      {false && (
      <section id="pricing" className="py-20 relative z-10 border-t-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-base font-bold text-emerald-700 mb-4">
              <Rocket className="w-5 h-5" />
              Simple Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Plans for Every Institution</h2>
            <p className="text-lg text-slate-500 mt-3">Start free, scale as you grow</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$0"
              period="month"
              features={['Up to 100 students', 'Basic attendance', '1 faculty account', 'Community support']}
              delay={0}
            />
            <PricingCard
              name="Pro"
              price="$49"
              period="month"
              features={['Up to 1,000 students', 'AI study plans', 'Advanced analytics', 'Priority support', 'Custom branding']}
              popular
              delay={0.1}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period="contact us"
              features={['Unlimited students', 'Dedicated AI models', 'SSO & SAML', '24/7 support', 'On-prem deployment']}
              delay={0.2}
            />
          </div>
        </div>
      </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 border-t-2 border-slate-200 bg-white relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-50 border border-sky-200 text-base font-bold text-sky-700 mb-4">
              <HelpCircle className="w-5 h-5" />
              Got Questions?
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </motion.div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-14 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #0EA5E9 100%)' }}
          >
            <Orb className="w-64 h-64 bg-white/10 -top-16 -left-16" />
            <Orb className="w-48 h-48 bg-white/10 -bottom-12 -right-12" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border border-white/30 text-base font-bold text-white">
                <Sparkles className="w-5 h-5" />
                SIH 2026 — Smart India Hackathon
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to transform your institution?
              </h2>
              <p className="text-white/80 text-xl max-w-2xl mx-auto">
                Join thousands already using EduVision.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/register" className="px-8 py-4 rounded-2xl bg-white/15 border-2 border-white/30 text-white font-bold text-lg hover:bg-white/25 transition-colors">
                    Create Account
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t-2 border-slate-200 py-12 text-slate-500 relative z-10 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">EduVision</p>
                  <p className="text-sm text-slate-400">Academic OS v2.4</p>
                </div>
              </div>
              <p className="text-base leading-relaxed">
                Smart education intelligence for modern institutions.
              </p>
              <div className="flex items-center gap-3">
                {[Share2, Globe2, Send, Rss, Mail].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.15, y: -3 }}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-indigo-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Product</h4>
              <ul className="flex flex-col gap-3">
                {['Features', 'Pricing', 'How It Works', 'Testimonials', 'FAQ'].map((item) => (
                  <li key={item}>
                    <Link href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-base hover:text-indigo-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Company</h4>
              <ul className="flex flex-col gap-3">
                {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-base hover:text-indigo-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Contact</h4>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-base">
                  <Phone className="w-5 h-5 text-indigo-500" /> +91 98765 43210
                </li>
                <li className="flex items-center gap-3 text-base">
                  <Mail className="w-5 h-5 text-indigo-500" /> hello@eduvis.io
                </li>
                <li className="flex items-center gap-3 text-base">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Bengaluru, India
                </li>
                <li className="flex items-center gap-3 text-base">
                  <Globe className="w-5 h-5 text-indigo-500" /> www.eduvis.io
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-base">© 2026 EduVision — Smart India Hackathon Architecture</p>
            <div className="flex items-center gap-4 text-base text-slate-600">
              {['Next.js App Router', 'MongoDB', 'Gemini AI', 'face-api.js'].map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <span>•</span>}
                  <span>{t}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}