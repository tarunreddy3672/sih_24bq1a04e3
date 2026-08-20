'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CheckCircle2, XCircle, Save, Users, ShieldCheck,
  Play, Square, ShieldAlert, AlertCircle, AlertTriangle, UserX,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Badge from '@/components/shared/Badge';

interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  classOrSubject: string;
  faceEmbedding: number[];
  status: 'present' | 'absent';
  confidenceScore: number;
  voteCount: number;
  consecutiveMisses: number;
}

const SECTIONS = [
  'CSE-A','CSE-B','CSE-C','ECE-A','ECE-B','ECE-C',
  'IT-A','IT-B','IT-C','AI-A','AI-B','AI-C',
  'MECH-A','MECH-B','MECH-C','CIVIL-A','CIVIL-B','CIVIL-C',
];

const VOTES_REQUIRED    = 5;    // consecutive frames needed to confirm presence
const MATCH_THRESHOLD   = 0.50; // combined distance threshold
const MIN_CONFIDENCE    = 75;   // % — below this = warn, never auto-mark present
const MAX_FACES_ALLOWED = 1;    // warn if more than 1 face in frame

function normalize(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return mag === 0 ? v : v.map(x => x / mag);
}
function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}
function cosineDistance(a: number[], b: number[]): number {
  return 1 - a.reduce((s, v, i) => s + v * b[i], 0);
}
function combinedDist(a: number[], b: number[]): number {
  const na = normalize(a), nb = normalize(b);
  return 0.5 * euclidean(na, nb) + 0.5 * cosineDistance(na, nb);
}

// face-api distances: 0.0=identical, ~0.6=different person
// Map to 0–100% so dist=0→100%, dist=0.6→0%
function distToConfidence(dist: number): number {
  return Math.round(Math.max(0, Math.min(100, (1 - dist / 0.6) * 100)));
}

type Warning = 'multi-face' | 'low-conf' | 'unknown' | null;

interface LiveResult {
  label: string;
  conf: number;
  matched: boolean;
  studentId: string;
}

export default function FacultyAttendancePage() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const loopRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceApiRef  = useRef<any>(null);
  const studentsRef = useRef<EnrolledStudent[]>([]);

  const [section, setSection]         = useState('CSE-A');
  const [students, setStudents]       = useState<EnrolledStudent[]>([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [cameraOn, setCameraOn]       = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live recognition state
  const [liveResults, setLiveResults]   = useState<LiveResult[]>([]);
  const [warning, setWarning]           = useState<Warning>(null);
  const [warningMsg, setWarningMsg]     = useState('');
  const [fps, setFps]                   = useState(0);
  const fpsRef = useRef({ count: 0, last: Date.now() });

  useEffect(() => { studentsRef.current = students; }, [students]);

  // Load models
  useEffect(() => {
    import('face-api.js').then(async (fapi) => {
      await Promise.all([
        fapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        fapi.nets.faceLandmark68Net.loadFromUri('/models'),
        fapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      faceApiRef.current = fapi;
      setModelsReady(true);
    }).catch(() => {}).finally(() => setModelLoading(false));
    return () => stopCamera();
  }, []);

  // Load roster on section change
  useEffect(() => {
    stopCamera();
    setStudents([]);
    setLiveResults([]);
    setWarning(null);
    fetch(`/api/face-embedding?section=${section}`)
      .then(r => r.json())
      .then(d => {
        if (d.students) {
          setStudents(d.students.map((u: any) => ({
            _id: u._id, name: u.name, email: u.email,
            classOrSubject: u.classOrSubject,
            faceEmbedding: u.faceEmbedding?.length ? normalize(u.faceEmbedding) : [],
            status: 'absent' as const,
            confidenceScore: 0,
            voteCount: 0,
            consecutiveMisses: 0,
          })));
        }
      }).catch(() => {});
  }, [section]);

  const stopCamera = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setLiveResults([]);
    setWarning(null);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user', frameRate: { ideal: 30 } },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOn(true);
      startLoop();
    } catch {
      alert('Camera access denied.');
    }
  };

  const startLoop = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(async () => {
      const fapi = faceApiRef.current;
      if (!fapi || !videoRef.current) return;

      // FPS
      fpsRef.current.count++;
      const now = Date.now();
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.count);
        fpsRef.current = { count: 0, last: now };
      }

      const detections = await fapi
        .detectAllFaces(videoRef.current, new fapi.SsdMobilenetv1Options({ minConfidence: 0.72 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      // ── MULTI-FACE WARNING ─────────────────────────────────────────────
      if (detections.length > MAX_FACES_ALLOWED) {
        setWarning('multi-face');
        setWarningMsg(`${detections.length} faces detected in frame. Only 1 student at a time is allowed for accurate recognition. Please ask others to step back.`);
        setLiveResults([]);
        // Reset all vote counts — can't trust any match when multiple faces present
        setStudents(prev => prev.map(s => ({ ...s, voteCount: 0, consecutiveMisses: 0 })));
        return;
      }

      if (!detections.length) {
        setWarning(null);
        setLiveResults([]);
        // Increment miss counter — never touch already-confirmed students
        setStudents(prev => prev.map(s => {
          if (s.status === 'present') return s;
          const misses = Math.min(s.consecutiveMisses + 1, 10);
          return misses >= 3
            ? { ...s, consecutiveMisses: misses, voteCount: 0 }
            : { ...s, consecutiveMisses: misses };
        }));
        return;
      }

      // ── SINGLE FACE — run recognition ─────────────────────────────────
      const det = detections[0];

      // Quality gate
      if (det.detection.score < 0.75) {
        setWarning('low-conf');
        setWarningMsg(`Face detection confidence too low (${Math.round(det.detection.score * 100)}%). Improve lighting or move closer.`);
        setLiveResults([]);
        return;
      }

      const descriptor = normalize(Array.from(det.descriptor) as number[]);
      const roster = studentsRef.current;

      // Find best match
      let best = { id: '', name: 'Unknown', dist: 999 };
      for (const s of roster) {
        if (!s.faceEmbedding?.length) continue;
        const dist = combinedDist(descriptor, s.faceEmbedding);
        if (dist < best.dist) best = { id: s._id, name: s.name, dist };
      }

      const conf = distToConfidence(best.dist);

      // ── UNKNOWN FACE ──────────────────────────────────────────────────
      if (best.dist > MATCH_THRESHOLD || !best.id) {
        setWarning('unknown');
        setWarningMsg(`Face not recognised (best distance: ${best.dist.toFixed(3)}, threshold: ${MATCH_THRESHOLD}). Student may not have registered their face.`);
        setLiveResults([{ label: 'Unknown', conf: 0, matched: false, studentId: '' }]);
        setStudents(prev => prev.map(s =>
          s.status === 'present' ? s : {
            ...s,
            consecutiveMisses: Math.min(s.consecutiveMisses + 1, 10),
            voteCount: s.consecutiveMisses + 1 >= 3 ? 0 : s.voteCount,
          }
        ));
        return;
      }

      // ── LOW CONFIDENCE WARNING ─────────────────────────────────────────
      if (conf < MIN_CONFIDENCE) {
        setWarning('low-conf');
        setWarningMsg(`Possible match: ${best.name} — confidence ${conf}% is below minimum ${MIN_CONFIDENCE}%. Ask the student to reposition or improve lighting.`);
        setLiveResults([{ label: best.name, conf, matched: false, studentId: best.id }]);
        return;
      }

      // ── GOOD MATCH ────────────────────────────────────────────────────
      setWarning(null);
      setLiveResults([{ label: best.name, conf, matched: true, studentId: best.id }]);

      setStudents(prev => prev.map(s => {
        if (s.status === 'present') return s; // already confirmed, never touch
        if (s._id !== best.id) {
          const misses = Math.min(s.consecutiveMisses + 1, 10);
          return { ...s, consecutiveMisses: misses, voteCount: misses >= 3 ? 0 : s.voteCount };
        }
        const newVotes = s.voteCount + 1;
        if (newVotes >= VOTES_REQUIRED) {
          return { ...s, status: 'present', confidenceScore: conf, voteCount: newVotes, consecutiveMisses: 0 };
        }
        return { ...s, voteCount: newVotes, consecutiveMisses: 0 };
      }));
    }, 500);
  };

  const handleCommit = async () => {
    setIsSaving(true); setSaveSuccess(false);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: students.map(s => ({
            studentId: s._id,
            status: s.status === 'present' ? 'present' : 'absent',
            confidenceScore: s.confidenceScore,
            livenessVerified: s.status === 'present',
            livenessChallenge: 'face-recognition',
          })),
        }),
      });
      if (res.ok) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 4000); }
    } catch { /* ignore */ }
    finally { setIsSaving(false); }
  };

  const presentCount     = students.filter(s => s.status === 'present').length;
  const enrolledWithFace = students.filter(s => s.faceEmbedding?.length > 0).length;

  const warningColors: Record<NonNullable<Warning>, string> = {
    'multi-face': 'bg-rose-50 border-rose-300 text-rose-800',
    'low-conf':   'bg-amber-50 border-amber-300 text-amber-800',
    'unknown':    'bg-orange-50 border-orange-300 text-orange-800',
  };
  const warningIcons: Record<NonNullable<Warning>, React.ReactNode> = {
    'multi-face': <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    'low-conf':   <AlertCircle   className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    'unknown':    <UserX         className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Face Attendance" roleBadge="FACULTY" />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 space-y-5 overflow-y-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Real-Time Face Recognition</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                SsdMobilenetv1 · {VOTES_REQUIRED}-vote lock · min {MIN_CONFIDENCE}% confidence · 1 face at a time
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={section} onChange={e => setSection(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-indigo-400 shadow-sm">
                {SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
                Present: <strong className="text-emerald-600">{presentCount}</strong> / {students.length}
              </span>
              <motion.button onClick={handleCommit} disabled={isSaving || !students.length}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-emerald-100">
                <Save className="w-4 h-4" />{isSaving ? 'Saving…' : 'Commit Attendance'}
              </motion.button>
            </div>
          </div>

          {/* Model status */}
          <div className="p-3.5 rounded-2xl flex items-start gap-3 bg-indigo-50 border border-indigo-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700">
              <strong className="text-indigo-800">
                {modelLoading ? 'Loading models…' : modelsReady ? 'Models ready · ' : 'Model load failed · '}
              </strong>
              {modelsReady && `${enrolledWithFace}/${students.length} faces enrolled · ${VOTES_REQUIRED} consecutive matches required · confidence ≥ ${MIN_CONFIDENCE}% · 1 face per frame`}
            </p>
          </div>

          {/* No face data warning */}
          {enrolledWithFace === 0 && students.length > 0 && (
            <div className="p-3.5 rounded-2xl flex items-start gap-3 bg-amber-50 border border-amber-200 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                <strong className="text-amber-800">No face data enrolled — </strong>
                Students must visit <strong>Dashboard → Register Face</strong> first.
              </p>
            </div>
          )}

          {/* Live warning banner */}
          <AnimatePresence>
            {warning && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${warningColors[warning]}`}>
                {warningIcons[warning]}
                <div>
                  <strong className="block mb-0.5">
                    {warning === 'multi-face' ? '⚠ Multiple Faces Detected — Recognition Paused'
                      : warning === 'low-conf' ? '⚠ Low Confidence Match'
                      : '⚠ Unknown Face'}
                  </strong>
                  {warningMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Attendance committed successfully!
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Camera panel */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col" style={{ height: 500 }}>
                <div className="relative flex-1 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted
                    className={`w-full h-full object-cover -scale-x-100 ${cameraOn ? 'block' : 'hidden'}`}
                  />

                  {/* Recognition result overlay */}
                  {cameraOn && liveResults.length > 0 && (
                    <div className="absolute top-3 left-3 right-3 space-y-1">
                      {liveResults.map((r, i) => (
                        <div key={i} className={`text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 ${
                          !r.matched ? 'bg-rose-900/85 text-rose-100'
                            : r.conf >= MIN_CONFIDENCE ? 'bg-emerald-900/85 text-emerald-100'
                            : 'bg-amber-900/85 text-amber-100'
                        }`}>
                          {!r.matched ? '✗' : r.conf >= MIN_CONFIDENCE ? '✓' : '⚠'}
                          <span className="font-bold">{r.label}</span>
                          {r.conf > 0 && <span className="ml-auto opacity-80">{r.conf}% confidence</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Multi-face overlay */}
                  {cameraOn && warning === 'multi-face' && (
                    <div className="absolute inset-0 border-4 border-rose-500/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="bg-rose-900/90 text-rose-100 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> MULTIPLE FACES — PAUSED
                      </div>
                    </div>
                  )}

                  {/* Bottom HUD */}
                  {cameraOn && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full live-indicator ${warning === 'multi-face' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                        {warning === 'multi-face' ? 'PAUSED' : 'SCANNING'} · SsdMobilenetv1
                      </span>
                      <span>{fps} fps · thr {MATCH_THRESHOLD} · {VOTES_REQUIRED}-vote</span>
                    </div>
                  )}

                  {!cameraOn && (
                    <div className="text-center space-y-3 p-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                        <Camera className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-white">Camera Inactive</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {modelsReady ? 'Start camera. Students approach one at a time.' : modelLoading ? 'Loading AI models…' : 'Models unavailable.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {!cameraOn
                    ? <motion.button onClick={startCamera} disabled={!modelsReady} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40">
                        <Play className="w-3.5 h-3.5" /> Start Camera
                      </motion.button>
                    : <motion.button onClick={stopCamera} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5">
                        <Square className="w-3.5 h-3.5" /> Stop Camera
                      </motion.button>
                  }
                  <span className="text-[11px] text-slate-500 font-mono">
                    {modelLoading ? 'Loading…' : modelsReady ? '✓ SsdMobilenetv1 ready' : '✗ Models failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Roster — READ ONLY, no manual toggle */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col" style={{ height: 500 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" /> {section} Roster
                  </h3>
                  <Badge variant="indigo" size="sm">{students.length} Enrolled</Badge>
                </div>

                <p className="text-[10px] text-slate-400 mb-3 font-mono">
                  Face recognition only · use Manual Attendance page for overrides
                </p>

                {students.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                    No students found for {section}
                  </div>
                )}

                <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                  {students.map(s => {
                    const isPresent    = s.status === 'present';
                    const isMatching   = liveResults[0]?.studentId === s._id && liveResults[0]?.matched;
                    const voteProgress = Math.min(s.voteCount / VOTES_REQUIRED, 1);

                    return (
                      <motion.div key={s._id} layout
                        className={`p-3 rounded-xl border transition-all ${
                          isPresent   ? 'bg-emerald-50 border-emerald-200'
                          : isMatching ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-slate-50 border-slate-200'
                        }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">{s.name}</span>
                              {isPresent && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono flex items-center gap-0.5">
                                  <ShieldAlert className="w-2.5 h-2.5" /> Face {s.confidenceScore}%
                                </span>
                              )}
                              {!s.faceEmbedding?.length && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 font-mono">No face</span>
                              )}
                            </div>

                            {/* Vote progress bar — only shown while building up */}
                            {!isPresent && s.voteCount > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <motion.div className="h-full bg-indigo-400 rounded-full"
                                    animate={{ width: `${voteProgress * 100}%` }} transition={{ duration: 0.2 }} />
                                </div>
                                <p className="text-[9px] text-slate-400 font-mono">{s.voteCount}/{VOTES_REQUIRED} votes</p>
                              </div>
                            )}
                          </div>

                          {/* Status badge — display only, not clickable */}
                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                            isPresent   ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : isMatching ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {isPresent
                              ? <><CheckCircle2 className="w-3 h-3" /> Present</>
                              : isMatching
                              ? <><Camera className="w-3 h-3" /> Scanning…</>
                              : <><XCircle className="w-3 h-3" /> Absent</>
                            }
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Read-only · {VOTES_REQUIRED}-vote confirmation</span>
                  <span className="font-mono text-indigo-600 font-semibold">{presentCount}/{students.length} confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
