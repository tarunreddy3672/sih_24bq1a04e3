'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import Badge from '@/components/shared/Badge';
import ProgressRing from '@/components/shared/ProgressRing';
import StreakFlame from '@/components/dashboard/StreakFlame';
import { Award, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import LoadingState from '@/components/shared/LoadingState';

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
        </div>
      ) : (
        <p className="text-xs text-slate-500">Failed to load student record.</p>
      )}
    </Modal>
  );
}
