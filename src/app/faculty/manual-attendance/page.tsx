'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, CheckCircle2, Users, CalendarCheck,
  Save, RefreshCw, ChevronDown,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar  from '@/components/dashboard/Topbar';

const SECTIONS: Record<string, string[]> = {
  CSE:   ['CSE-A',   'CSE-B',   'CSE-C'],
  ECE:   ['ECE-A',   'ECE-B',   'ECE-C'],
  IT:    ['IT-A',    'IT-B',    'IT-C'],
  AI:    ['AI-A',    'AI-B',    'AI-C'],
  MECH:  ['MECH-A',  'MECH-B',  'MECH-C'],
  CIVIL: ['CIVIL-A', 'CIVIL-B', 'CIVIL-C'],
};
const ALL_SECTIONS = Object.values(SECTIONS).flat();

const SUBJECTS_FALLBACK: Record<string, string> = {
  'CSE-A': 'Digital Electronics',          'CSE-B': 'Data Structures & Algorithms', 'CSE-C': 'Computer Networks',
  'ECE-A': 'Signals & Systems',            'ECE-B': 'VLSI Design',                  'ECE-C': 'Analog Circuits',
  'IT-A':  'Database Management Systems',  'IT-B':  'Web Technologies',             'IT-C':  'Operating Systems',
  'AI-A':  'Deep Learning & Neural Nets',  'AI-B':  'Machine Learning',             'AI-C':  'Computer Vision',
  'MECH-A':'Engineering Mechanics',        'MECH-B':'Thermodynamics',               'MECH-C':'Fluid Mechanics',
  'CIVIL-A':'Structural Analysis',         'CIVIL-B':'Geotechnical Engineering',    'CIVIL-C':'Transportation Engineering',
};

const STATUS_OPTS = ['present', 'absent', 'late'] as const;
type Status = typeof STATUS_OPTS[number];

const STATUS_COLOR: Record<Status, string> = {
  present: 'bg-emerald-500 text-white border-emerald-500',
  absent:  'bg-rose-500 text-white border-rose-500',
  late:    'bg-amber-500 text-white border-amber-500',
};
const STATUS_IDLE: Record<Status, string> = {
  present: 'bg-white border-slate-300 text-slate-600 hover:bg-emerald-50 hover:border-emerald-400',
  absent:  'bg-white border-slate-300 text-slate-600 hover:bg-rose-50 hover:border-rose-400',
  late:    'bg-white border-slate-300 text-slate-600 hover:bg-amber-50 hover:border-amber-400',
};

interface StudentRow { id: string; name: string; email: string; status: Status; }
interface PastSession { _id: string; section: string; subject: string; date: string; records: any[]; }

export default function ManualAttendancePage() {
  const [section, setSection]   = useState('CSE-A');
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>(SUBJECTS_FALLBACK);
  const [date, setDate]         = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [past, setPast]         = useState<PastSession[]>([]);
  const [markAll, setMarkAll]   = useState<Status>('present');

  const loadRoster = useCallback(async (sec: string) => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/manual-attendance?section=${sec}`);
      const data = await res.json();
      const roster: StudentRow[] = (data.roster || []).map((u: any) => ({
        id: String(u._id), name: u.name, email: u.email, status: 'present',
      }));
      // Demo fallback if no DB students
      if (!roster.length) {
        setStudents([
          { id: '64f1a2b3c4d5e6f7a8b9c001', name: 'Aarav Sharma', email: 'student@eduvision.ai', status: 'present' },
          { id: '64f1a2b3c4d5e6f7a8b9c002', name: 'Diya Patel',   email: 'diya@eduvision.ai',    status: 'present' },
          { id: '64f1a2b3c4d5e6f7a8b9c003', name: 'Rohan Verma',  email: 'rohan@eduvision.ai',   status: 'present' },
        ]);
      } else {
        setStudents(roster);
      }
    } catch { setError('Failed to load roster.'); }
    finally { setLoading(false); }
  }, []);

  const loadPast = useCallback(async () => {
    try {
      const res  = await fetch('/api/manual-attendance');
      const data = await res.json();
      setPast(data.sessions || []);
    } catch { /* keep */ }
  }, []);

  useEffect(() => {
    fetch('/api/subject-assignments')
      .then(r => r.json())
      .then(d => {
        if (d.assignments?.length) {
          const map: Record<string, string> = { ...SUBJECTS_FALLBACK };
          d.assignments.forEach((a: any) => { map[a.section] = a.subject; });
          setSubjectMap(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadRoster(section); }, [section, loadRoster]);
  useEffect(() => { loadPast(); }, [loadPast]);

  const setStatus = (id: string, status: Status) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  const handleMarkAll = (status: Status) => {
    setMarkAll(status);
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/manual-attendance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section, subject: subjectMap[section] || section, date,
          records: students.map(s => ({ studentId: s.id, name: s.name, status: s.status })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        loadPast();
        setTimeout(() => setSaved(false), 4000);
      } else { setError(data.error || 'Failed to save.'); }
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount  = students.filter(s => s.status === 'absent').length;
  const lateCount    = students.filter(s => s.status === 'late').length;
  const pct = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Manual Attendance" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 overflow-y-auto">

          <div className="pb-2 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Attendance Marking</h1>
            <p className="text-xs text-slate-500 mt-1">Mark attendance manually — syncs to student dashboard and admin panel instantly.</p>
          </div>

          {/* Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                <select value={section} onChange={e => setSection(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none">
                  {ALL_SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-medium">
                  {subjectMap[section] || section}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none" />
              </div>
            </div>

            {/* Mark all buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600">Mark all:</span>
              {STATUS_OPTS.map(s => (
                <button key={s} onClick={() => handleMarkAll(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${markAll === s ? STATUS_COLOR[s] : STATUS_IDLE[s]}`}>
                  {s}
                </button>
              ))}
              <button onClick={() => loadRoster(section)} disabled={loading}
                className="ml-auto px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload Roster
              </button>
            </div>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total',   value: students.length, color: 'text-slate-700 bg-slate-50 border-slate-200' },
              { label: 'Present', value: presentCount,    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { label: 'Absent',  value: absentCount,     color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { label: 'Late',    value: lateCount,       color: 'text-amber-700 bg-amber-50 border-amber-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{s.label}</p>
                <p className="text-xl font-black mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Attendance progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-700">
              <span>Attendance Rate</span><span className={pct >= 75 ? 'text-emerald-700' : 'text-rose-700'}>{pct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 85 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Feedback */}
          {error  && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
          {saved  && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attendance saved! Reflected in student dashboard and admin panel.
            </div>
          )}

          {/* Student list */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> {section} Roster — {students.length} students
              </h3>
              <button onClick={handleSave} disabled={saving || students.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs">
                <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>

            {loading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {students.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <span className="text-[11px] font-mono text-slate-400 w-6 shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {STATUS_OPTS.map(st => (
                        <button key={st} onClick={() => setStatus(s.id, st)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold capitalize transition-all ${s.status === st ? STATUS_COLOR[st] : STATUS_IDLE[st]}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
              <button onClick={handleSave} disabled={saving || students.length === 0}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs">
                <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Past sessions */}
          {past.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-indigo-600" /> Recent Sessions
              </h3>
              <div className="space-y-2">
                {past.slice(0, 5).map((p, i) => {
                  const pres = (p.records || []).filter((r: any) => r.status === 'present').length;
                  const tot  = (p.records || []).length;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{p.section}</span>
                        <span className="text-slate-500 ml-2">{p.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
                        <span className={`font-bold ${tot ? (pres/tot >= 0.75 ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}`}>
                          {pres}/{tot} present
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
