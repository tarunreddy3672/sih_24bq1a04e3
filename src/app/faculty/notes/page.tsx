'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Link as LinkIcon, Megaphone, BookOpen, Clock } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar  from '@/components/dashboard/Topbar';

const BRANCHES = ['CSE', 'ECE', 'IT', 'AI', 'MECH', 'CIVIL'];
const SECTIONS: Record<string, string[]> = {
  CSE:   ['CSE-A',   'CSE-B',   'CSE-C'],
  ECE:   ['ECE-A',   'ECE-B',   'ECE-C'],
  IT:    ['IT-A',    'IT-B',    'IT-C'],
  AI:    ['AI-A',    'AI-B',    'AI-C'],
  MECH:  ['MECH-A',  'MECH-B',  'MECH-C'],
  CIVIL: ['CIVIL-A', 'CIVIL-B', 'CIVIL-C'],
};
const TYPE_META = {
  note:         { label: 'Note',         icon: FileText,   color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  resource:     { label: 'Resource',     icon: LinkIcon,   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  announcement: { label: 'Announcement', icon: Megaphone,  color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

interface NoteItem {
  _id: string; title: string; content: string; subject: string;
  branch: string; section: string; type: string; resourceUrl: string;
  createdAt: string; uploadedBy?: { name: string };
}

export default function FacultyNotesPage() {
  const [form, setForm] = useState({
    title: '', content: '', subject: '',
    branch: 'CSE', type: 'note', resourceUrl: '',
  });
  const [selectedSections, setSelectedSections] = useState<string[]>(['CSE-A']);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [notes, setNotes]     = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleSection = (s: string) => {
    setSelectedSections(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/notes');
      const data = await res.json();
      if (data.notes) setNotes(data.notes);
    } catch { /* keep */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleBranchChange = (branch: string) => {
    setForm(f => ({ ...f, branch }));
    setSelectedSections([SECTIONS[branch]?.[0] || '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    if (!form.subject.trim()) { setError('Subject is required.'); return; }
    if (selectedSections.length === 0) { setError('Select at least one section.'); return; }
    setSaving(true);
    try {
      // Post to each selected section
      const results = await Promise.all(selectedSections.map(section =>
        fetch('/api/notes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, section }),
        }).then(r => r.json())
      ));
      const failed = results.find(r => !r.success);
      if (failed) { setError(failed.error || 'Failed to post.'); }
      else {
        setSuccess(true);
        setForm(f => ({ ...f, title: '', content: '', resourceUrl: '' }));
        fetchNotes();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Notes & Resources" roleBadge="FACULTY" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          <div className="pb-2 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post Notes & Resources</h1>
            <p className="text-xs text-slate-500 mt-1">Posts are instantly visible on the student dashboard for the selected branch & section.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Post Form ── */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" /> New Post
                </h2>

                {error   && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
                {success && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Posted! Students can now see this on their dashboard.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Type selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(TYPE_META) as (keyof typeof TYPE_META)[]).map(t => {
                      const { label, icon: Icon, color } = TYPE_META[t];
                      const active = form.type === t;
                      return (
                        <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                          className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${active ? color + ' ring-2 ring-offset-1 ring-current/30' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                          <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. MOSFET Summary Sheet"
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
                    <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="Write your note, resource description, or announcement..."
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none resize-none" />
                  </div>

                  {form.type === 'resource' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Resource URL</label>
                      <input type="url" value={form.resourceUrl} onChange={e => setForm(f => ({ ...f, resourceUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                    <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. Data Structures & Algorithms"
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                    <select value={form.branch} onChange={e => handleBranchChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none">
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sections * <span className="text-slate-400 font-normal">(select multiple)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {(SECTIONS[form.branch] || []).map(s => (
                        <button key={s} type="button" onClick={() => toggleSection(s)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            selectedSections.includes(s)
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all">
                    <Send className="w-4 h-4" />
                    {saving ? 'Posting...' : 'Post to Students'}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Posted Notes List ── */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> All Posts
                  <span className="ml-auto text-xs text-slate-400 font-normal">{notes.length} total</span>
                </h2>
                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}</div>
                ) : notes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No posts yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {notes.map(n => {
                      const meta = TYPE_META[n.type as keyof typeof TYPE_META] || TYPE_META.note;
                      const Icon = meta.icon;
                      return (
                        <div key={n._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                          <div className="flex items-start gap-3">
                            <span className={`mt-0.5 p-1.5 rounded-lg border text-xs ${meta.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[13px] font-semibold text-slate-900 truncate">{n.title}</p>
                                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded border ${meta.color}`}>{meta.label}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.content}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{n.subject}</span>
                                <span className="text-[10px] text-slate-400">{n.branch} · {n.section}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {n.resourceUrl && (
                                <a href={n.resourceUrl} target="_blank" rel="noopener noreferrer"
                                  className="mt-1.5 text-[11px] text-emerald-600 hover:underline flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3" /> {n.resourceUrl}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
