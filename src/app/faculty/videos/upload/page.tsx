'use client';

import React, { useState, useEffect } from 'react';
import { Video, Upload, CheckCircle2, Trash2, PlayCircle, Clock, BookOpen } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

const BRANCHES = ['CSE', 'ECE', 'IT', 'AI', 'MECH', 'CIVIL'];

const SECTIONS: Record<string, string[]> = {
  CSE:   ['CSE-A',   'CSE-B',   'CSE-C'],
  ECE:   ['ECE-A',   'ECE-B',   'ECE-C'],
  IT:    ['IT-A',    'IT-B',    'IT-C'],
  AI:    ['AI-A',    'AI-B',    'AI-C'],
  MECH:  ['MECH-A',  'MECH-B',  'MECH-C'],
  CIVIL: ['CIVIL-A', 'CIVIL-B', 'CIVIL-C'],
};

interface VideoLecture {
  _id: string;
  title: string;
  subject: string;
  branch: string;
  section: string;
  videoUrl: string;
  duration: string;
  description: string;
  createdAt: string;
  uploadedBy?: { name: string };
}

export default function FacultyVideoUploadPage() {
  const [form, setForm] = useState({
    title: '', description: '', subject: '',
    branch: 'CSE', section: 'CSE-A', videoUrl: '', duration: '',
  });
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [videos, setVideos]       = useState<VideoLecture[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError]     = useState('');
  const [previewUrl, setPreviewUrl]   = useState('');

  const fetchVideos = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res  = await fetch('/api/video-lectures');
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
      else setListError(data.error || 'Failed to load lectures.');
    } catch (e: any) {
      setListError(e?.message || 'Network error loading lectures.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  // Auto-update section when branch changes
  const handleBranchChange = (branch: string) => {
    const firstSection = SECTIONS[branch]?.[0] || '';
    setForm(f => ({ ...f, branch, section: firstSection }));
  };

  // Convert YouTube watch URL → embed URL
  function toEmbedUrl(url: string) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      }
      if (u.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed${u.pathname}`;
      }
    } catch { /* not a URL */ }
    return url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.videoUrl.trim()) {
      setError('Title and Video URL are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, videoUrl: toEmbedUrl(form.videoUrl) };
      const res  = await fetch('/api/video-lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setForm(f => ({ ...f, title: '', description: '', videoUrl: '', duration: '' }));
        setPreviewUrl('');
        fetchVideos();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to upload video lecture.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Video Lecture Management" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          {/* Header */}
          <div className="pb-2 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Video Lecture</h1>
            <p className="text-xs text-slate-500 mt-1">Videos are instantly visible to enrolled students in the selected branch & section.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Upload Form */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" /> New Video Lecture
                </h2>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
                )}
                {success && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Video lecture published! Students can now watch it.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. MOSFET Biasing — Lecture 3"
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Video URL * (YouTube / Drive / direct)</label>
                    <input
                      type="text" value={form.videoUrl}
                      onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none"
                    />
                    {form.videoUrl && (
                      <button type="button" onClick={() => setPreviewUrl(toEmbedUrl(form.videoUrl))}
                        className="mt-1.5 text-[11px] text-indigo-600 hover:underline flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" /> Preview video
                      </button>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video">
                      <iframe src={previewUrl} className="w-full h-full" allowFullScreen title="preview" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                      <input
                        type="text" value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="e.g. Data Structures & Algorithms"
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                      <input type="text" value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                        placeholder="e.g. 45 min"
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                      <select value={form.branch} onChange={e => handleBranchChange(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none">
                        {BRANCHES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                      <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs outline-none">
                        {(SECTIONS[form.branch] || []).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea rows={3} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief overview of what this lecture covers..."
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none resize-none" />
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs">
                    <Upload className="w-4 h-4" />
                    {saving ? 'Publishing...' : 'Publish to Students'}
                  </button>
                </form>
              </div>
            </div>

            {/* Published Videos List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" /> Published Lectures
                  <span className="ml-auto text-xs text-slate-400 font-normal">{videos.length} total</span>
                </h2>

                {loadingList ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : listError ? (
                  <p className="text-xs text-rose-500 text-center py-8">{listError}</p>
                ) : videos.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No video lectures published yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {videos.map((v) => (
                      <div key={v._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <PlayCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{v.title}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-medium">{v.subject}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />{v.branch} · {v.section}
                            </span>
                            {v.duration && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{v.duration}
                              </span>
                            )}
                          </div>
                          {v.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{v.description}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
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
