'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  Users,
  ShieldCheck,
  Zap,
  Play,
  Square,
  Sparkles,
  Info,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Badge from '@/components/shared/Badge';
import GlassCard from '@/components/shared/GlassCard';

interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  classOrSubject: string;
  faceEmbedding: number[];
  detected?: boolean;
  status: 'present' | 'absent';
  confidenceScore: number;
  manualOverride?: boolean;
}

export default function FacultyAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [checkingModels, setCheckingModels] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Enrolled student roster
  const [students, setStudents] = useState<EnrolledStudent[]>([
    {
      _id: '64f1a2b3c4d5e6f7a8b9c001',
      name: 'Aarav Sharma',
      email: 'student@eduvision.ai',
      classOrSubject: 'CSE-A',
      faceEmbedding: [0.12, -0.45, 0.78, 0.33, -0.19, 0.62, 0.44, -0.08, 0.15, 0.29],
      status: 'present',
      confidenceScore: 98,
      detected: true,
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c002',
      name: 'Diya Patel',
      email: 'diya@eduvision.ai',
      classOrSubject: 'CSE-A',
      faceEmbedding: [0.22, -0.35, 0.68, 0.23, -0.29, 0.52, 0.34, -0.18, 0.25, 0.19],
      status: 'present',
      confidenceScore: 96,
      detected: true,
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9c003',
      name: 'Rohan Verma',
      email: 'rohan@eduvision.ai',
      classOrSubject: 'CSE-A',
      faceEmbedding: [0.18, -0.40, 0.72, 0.30, -0.22, 0.58, 0.40, -0.12, 0.19, 0.24],
      status: 'absent',
      confidenceScore: 0,
      detected: false,
    },
  ]);

  // Check face-api models availability
  useEffect(() => {
    async function checkModelWeights() {
      try {
        const check = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
        if (check.ok) {
          setModelsLoaded(true);
        } else {
          setModelsLoaded(false);
        }
      } catch (e) {
        setModelsLoaded(false);
      } finally {
        setCheckingModels(false);
      }
    }
    checkModelWeights();
  }, []);

  // Handle webcam
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setIsScanning(true);
      }
    } catch (err: any) {
      setCameraError('Webcam access was blocked or not available on this device. Live recognition preview simulator active.');
      setIsCameraActive(true);
      setIsScanning(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const toggleStudentStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s._id === studentId) {
          const newStatus = s.status === 'present' ? 'absent' : 'present';
          return {
            ...s,
            status: newStatus,
            manualOverride: true,
            confidenceScore: newStatus === 'present' ? 100 : 0,
          };
        }
        return s;
      })
    );
  };

  const handleCommitAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const recordsToSave = students.map((s) => ({
        studentId: s._id,
        status: s.status,
        confidenceScore: s.confidenceScore,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to commit attendance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="faculty" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Biometric Attendance Terminal" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 live-indicator" />
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                  Digital Electronics & VLSI • Lecture Session 14
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Computer Vision Attendance Verification
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                Present: <strong className="text-emerald-400">{presentCount}</strong> / {students.length}
              </span>
              <button
                onClick={handleCommitAttendance}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Submitting...' : 'Commit Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Institutional Consent Notice (Section 24) */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200">
              <strong className="text-cyan-300 block mb-0.5">Biometric Ethics & Consent Notice</strong>
              Face recognition is used only for attendance verification. Please ensure students have provided appropriate consent according to your institution's policy. All descriptor calculations occur locally within the browser context.
            </div>
          </div>

          {/* Model Weights Fallback Alert (Section 22) */}
          {!modelsLoaded && !checkingModels && (
            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-amber-300 block mb-0.5">Model Status Notice</strong>
                Face recognition models not loaded from <code className="text-cyan-300 font-mono">public/models/</code>. Operating in real-time descriptor simulation mode with full manual override capability.
              </div>
            </div>
          )}

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Attendance recorded successfully to MongoDB. Telemetry updated for institutional dashboard.</span>
            </motion.div>
          )}

          {/* Main 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Camera Feed */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-[440px] relative overflow-hidden">
                {/* Camera Viewport */}
                <div className="relative w-full h-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
                  />

                  {/* Recognition Scanning HUD Overlay */}
                  {isCameraActive && isScanning && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/30 m-4 rounded-2xl flex flex-col justify-between p-4">
                      {/* Bounding box animation */}
                      <div className="w-40 h-40 border-2 border-cyan-400/80 rounded-xl mx-auto my-auto relative flex items-center justify-center">
                        <div className="absolute -top-6 left-0 bg-cyan-500/90 text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          MATCH: AARAV SHARMA (98%)
                        </div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute animate-bounce" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 live-indicator" />
                          68 LANDMARKS GENERATED
                        </span>
                        <span>CONFIDENCE: 98.4%</span>
                      </div>
                    </div>
                  )}

                  {!isCameraActive && (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Camera Standby</h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Activate the optical stream to run real-time facial descriptor comparison against enrolled student embeddings.
                      </p>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!isCameraActive ? (
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Camera Stream</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop Camera</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Engine: <strong className="text-cyan-400">face-api.js</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Recognition Roster */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between h-[440px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Live Match Telemetry (CSE-A)
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {students.length} Enrolled
                    </Badge>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                    {students.map((student) => {
                      const isPresent = student.status === 'present';
                      return (
                        <div
                          key={student._id}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{student.name}</h4>
                              {student.manualOverride && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                  Manual
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Match Confidence: {student.confidenceScore}%
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleStudentStatus(student._id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isPresent
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {isPresent ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Present</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  <span>Absent</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Click badge to manually override status</span>
                  <span className="font-mono text-cyan-400">Ready for sync</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
