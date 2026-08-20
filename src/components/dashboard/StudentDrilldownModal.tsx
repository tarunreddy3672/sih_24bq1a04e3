'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import Badge from '@/components/shared/Badge';
import ProgressRing from '@/components/shared/ProgressRing';
import StreakFlame from '@/components/dashboard/StreakFlame';
import { Award, BookOpen, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import LoadingState from '@/components/shared/LoadingState';

const INTERVENTION_TYPES = [
  { value: 'mentor_meeting',       label: 'Mentor Meeting' },
  { value: 'remedial_content',     label: 'Remedial Content' },
  { value: 'learning_plan',        label: 'Learning Plan' },
  { value: 'assignment_recovery',  label: 'Assignment Recovery' },
  { value: 'ai_tutoring',          label: 'AI Tutoring' },
  { value: 'practice_test',        label: 'Practice Test' },
  { value: 'attendance_followup',  label: 'Attendance Follow-up' },
];

interface StudentDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
}

export default function StudentDrilldownModal({
  isOpen,
  onClose,
  studentId,
}: StudentDrilldownModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [form, setForm] = useState({ type: 'mentor_meeting', reason: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!studentId || !isOpen) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/student-profile?studentId=${studentId}`);
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Failed to load student profile drilldown:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [studentId, isOpen]);

  useEffect(() => {
    if (!studentId || !isOpen) return;
    fetch(`/api/interventions?studentId=${studentId}`)
      .then(r => r.json())
      .then(d => { if (d.interventions) setInterventions(d.interventions); })
      .catch(() => {});
  }, [studentId, isOpen]);

  async function handleCreateIntervention(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason.trim()) return;
    setSaving(true); setSaveMsg('');
    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setInterventions(prev => [data.intervention, ...prev]);
        setForm({ type: 'mentor_meeting', reason: '', notes: '' });
        setSaveMsg('Intervention created.');
      } else {
        setSaveMsg(data.error || 'Failed.');
      }
    } catch { setSaveMsg('Network error.'); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={profile ? `Student Academic Profile: ${profile.user.name}` : 'Student Academic Profile'}
      subtitle={profile ? `${profile.user.classOrSubject} • Student ID: ${profile.user._id}` : 'Loading...'}
      maxWidth="2xl"
    >
      {loading ? (
        <LoadingState message="Retrieving student academic record..." />
      ) : profile ? (
        <div className="space-y-6 text-xs text-slate-700">
          {/* Header Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 items-center">
            <div className="flex items-center gap-3">
              <ProgressRing
                percentage={profile.attendance.overallPercentage}
                size={80}
                strokeWidth={7}
                color="#4F46E5"
              />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Attendance</p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {profile.attendance.presentCount} / {profile.attendance.totalClasses} Days
                </p>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <StreakFlame streak={profile.streak?.currentStreak || 14} size="sm" />
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Standing</p>
              <Badge variant={profile.attendance.overallPercentage >= 85 ? 'emerald' : 'amber'} size="sm">
                {profile.attendance.overallPercentage >= 85 ? 'Good Standing' : 'Advisory Required'}
              </Badge>
            </div>
          </div>

          {/* Weak Topics Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Concepts Flagged for Review
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.weakTopics.map((topic: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Quiz Attempts History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Recent Assessment Scores
            </h4>
            <div className="space-y-2">
              {profile.quizAttempts.map((attempt: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {attempt.quizId?.subject || 'Digital Electronics'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-mono font-bold ${attempt.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Academic Consistency Badges
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(profile.streak?.badges || ['14-Day Consistency Master', 'VLSI Quiz Champion']).map(
                (badge: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium flex items-center gap-1"
                  >
                    <Award className="w-3 h-3 text-indigo-600" />
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Create Intervention */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Create Intervention
            </h4>
            <form onSubmit={handleCreateIntervention} className="space-y-2">
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-indigo-400"
              >
                {INTERVENTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                required
                placeholder="Reason (required)"
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
              />
              <textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Create'}
                </button>
                {saveMsg && <span className="text-[11px] text-emerald-600 font-medium">{saveMsg}</span>}
              </div>
            </form>

            {interventions.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Past Interventions</p>
                {interventions.slice(0, 3).map((iv: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-700">{INTERVENTION_TYPES.find(t => t.value === iv.type)?.label || iv.type}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      iv.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      iv.status === 'active'    ? 'bg-indigo-100 text-indigo-700' :
                                                  'bg-slate-100 text-slate-600'
                    }`}>{iv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Failed to load student record.</p>
      )}
    </Modal>
  );
}
