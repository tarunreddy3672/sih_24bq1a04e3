'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Scan, Sun, Move } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

type Status = 'idle' | 'loading-models' | 'ready' | 'capturing' | 'processing' | 'success' | 'error';

const TOTAL_SAMPLES = 30;
const POSE_HINTS = [
  'Look straight at the camera',
  'Slightly turn left',
  'Slightly turn right',
  'Tilt head slightly up',
  'Look straight again',
];

function normalize(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return mag === 0 ? v : v.map(x => x / mag);
}

export default function RegisterFacePage() {
  const { data: session } = useSession();
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceApiRef  = useRef<any>(null);
  const samplesRef  = useRef<number[][]>([]);

  const [status, setStatus]             = useState<Status>('idle');
  const [message, setMessage]           = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [poseHint, setPoseHint]         = useState(POSE_HINTS[0]);
  const [quality, setQuality]           = useState(0);

  useEffect(() => {
    setStatus('loading-models');
    setMessage('Loading face recognition models…');
    import('face-api.js').then(async (fapi) => {
      await Promise.all([
        fapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        fapi.nets.faceLandmark68Net.loadFromUri('/models'),
        fapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      faceApiRef.current = fapi;
      setStatus('ready');
      setMessage('Models ready. Start camera to register your face.');
    }).catch(() => {
      setStatus('error');
      setMessage('Failed to load models. Please refresh.');
    });
    return () => stopCamera();
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user', frameRate: { ideal: 30 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      samplesRef.current = [];
      setCaptureCount(0);
      setStatus('capturing');
      setMessage('Look straight at the camera. Hold still…');
      startDetectionLoop();
    } catch {
      setStatus('error');
      setMessage('Camera access denied. Please allow camera permissions.');
    }
  };

  const startDetectionLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const fapi = faceApiRef.current;
      if (!fapi || !videoRef.current) return;

      const detection = await fapi
        .detectSingleFace(videoRef.current, new fapi.SsdMobilenetv1Options({ minConfidence: 0.7 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceDetected(false);
        setQuality(0);
        setMessage('No face detected. Move closer, improve lighting.');
        return;
      }

      const score = detection.detection.score;
      const box = detection.detection.box;
      const sizePct = (box.width * box.height) / ((videoRef.current.videoWidth || 640) * (videoRef.current.videoHeight || 480));
      setQuality(Math.round(score * 100));

      if (score < 0.75 || sizePct < 0.04) {
        setFaceDetected(false);
        setMessage('Move closer to the camera for better quality.');
        return;
      }

      setFaceDetected(true);
      const descriptor = normalize(Array.from(detection.descriptor) as number[]);
      samplesRef.current = [...samplesRef.current, descriptor];
      const count = samplesRef.current.length;
      setCaptureCount(count);
      setPoseHint(POSE_HINTS[Math.floor(count / 6) % POSE_HINTS.length]);

      if (count >= TOTAL_SAMPLES) {
        clearInterval(intervalRef.current!);
        processEmbeddings(samplesRef.current);
      } else {
        setMessage(`Capturing… ${count}/${TOTAL_SAMPLES} — ${POSE_HINTS[Math.floor(count / 6) % POSE_HINTS.length]}`);
      }
    }, 300);
  };

  const processEmbeddings = async (samples: number[][]) => {
    setStatus('processing');
    stopCamera();
    setMessage('Computing optimal face descriptor…');

    const centroid = samples[0].map((_, i) => samples.reduce((s, v) => s + v[i], 0) / samples.length);
    const dists = samples.map(s => Math.sqrt(s.reduce((sum, v, i) => sum + (v - centroid[i]) ** 2, 0)));
    const meanDist = dists.reduce((a, b) => a + b, 0) / dists.length;
    const stdDist = Math.sqrt(dists.map(d => (d - meanDist) ** 2).reduce((a, b) => a + b, 0) / dists.length);
    const filtered = samples.filter((_, i) => dists[i] <= meanDist + stdDist);

    const maxDist = Math.max(...filtered.map((_, i) => dists[i]));
    const weights = filtered.map((_, i) => maxDist - dists[i] + 0.001);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const weighted = filtered[0].map((_, dim) =>
      filtered.reduce((sum, s, i) => sum + s[dim] * weights[i], 0) / totalW
    );
    const final = normalize(weighted);

    try {
      const res = await fetch('/api/face-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedding: final }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('success');
      setMessage(`Face registered with ${filtered.length} quality samples. You can now use face attendance.`);
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Failed to save face data.');
    }
  };

  const reset = () => {
    stopCamera();
    samplesRef.current = [];
    setCaptureCount(0);
    setFaceDetected(false);
    setQuality(0);
    setPoseHint(POSE_HINTS[0]);
    setStatus('ready');
    setMessage('Models ready. Start camera to register your face.');
  };

  const pct = Math.round((captureCount / TOTAL_SAMPLES) * 100);

  return (
    <div className="flex min-h-screen dash-bg text-slate-900">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Face Registration" subtitle={session?.user?.name || ''} roleBadge="STUDENT" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto space-y-5">

            {/* Privacy notice */}
            <div className="study-card p-4 flex items-start gap-3" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <strong className="text-indigo-800 block mb-0.5">Privacy Notice</strong>
                Only a 128-number mathematical descriptor is stored — no photos. All processing runs in your browser using SsdMobilenetv1 + 30-sample weighted averaging.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT: Camera */}
              <div className="lg:col-span-7 study-card p-6 space-y-4">
                {/* Video area */}
                <div className="relative rounded-xl bg-slate-900 overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover -scale-x-100 ${status === 'capturing' ? 'block' : 'hidden'}`}
                  />

                  {/* Face box overlay */}
                  {status === 'capturing' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className={`w-56 h-64 border-2 rounded-2xl transition-all duration-200 ${
                        faceDetected ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'border-white/20'
                      }`}>
                        {faceDetected && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                            ✓ FACE LOCKED · {quality}% quality
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pose hint */}
                  {status === 'capturing' && faceDetected && (
                    <div className="absolute top-3 left-3 right-3 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Move className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {poseHint}
                    </div>
                  )}

                  {/* Progress bar */}
                  {status === 'capturing' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}

                  {/* Idle/status overlay */}
                  {status !== 'capturing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                      {status === 'loading-models' && <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {status === 'processing'     && <div className="w-10 h-10 border-2 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin" />}
                      {status === 'success'        && <CheckCircle2 className="w-14 h-14 text-emerald-400" />}
                      {status === 'error'          && <AlertCircle  className="w-14 h-14 text-rose-400" />}
                      {status === 'ready'          && <Camera       className="w-14 h-14 text-slate-400" />}
                      <p className="text-sm text-slate-300 text-center px-8 leading-relaxed">{message}</p>
                    </div>
                  )}
                </div>

                {/* Capture progress dots */}
                {status === 'capturing' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{message}</span>
                      <span className="font-mono font-bold text-indigo-600">{captureCount}/{TOTAL_SAMPLES}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: TOTAL_SAMPLES }).map((_, i) => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < captureCount ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {status === 'ready' && (
                    <motion.button onClick={startCamera} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Scan className="w-4 h-4" /> Start Registration
                    </motion.button>
                  )}
                  {(status === 'success' || status === 'error') && (
                    <motion.button onClick={reset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4" /> Register Again
                    </motion.button>
                  )}
                  {status === 'capturing' && (
                    <motion.button onClick={reset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>

              {/* RIGHT: Instructions */}
              <div className="lg:col-span-5 space-y-4">

                {/* Status card */}
                <div className="study-card p-5 space-y-3">
                  <p className="text-sm font-bold text-slate-800">Registration Status</p>
                  <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                    status === 'success'   ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : status === 'error'  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : status === 'capturing' ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                    : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}>
                    {status === 'success'    && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                    {status === 'error'      && <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />}
                    {status === 'capturing'  && <Camera       className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{message || 'Initializing…'}</span>
                  </div>
                  {status === 'capturing' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Samples captured</span>
                        <span className="font-mono font-bold text-indigo-600">{captureCount}/{TOTAL_SAMPLES}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="study-card p-5 space-y-3">
                  <p className="text-sm font-bold text-slate-700">Tips for Best Accuracy</p>
                  <div className="space-y-3">
                    {[
                      { icon: Sun,          tip: 'Good front lighting — avoid backlight or harsh shadows' },
                      { icon: Move,         tip: 'Slightly vary your head angle during capture for better coverage' },
                      { icon: Camera,       tip: 'Keep face 40–60 cm from camera, centered in the frame' },
                      { icon: CheckCircle2, tip: 'Remove glasses if possible for first registration' },
                    ].map(({ icon: Icon, tip }, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-slate-600">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How it works */}
                <div className="study-card p-5 space-y-3">
                  <p className="text-sm font-bold text-slate-700">How Registration Works</p>
                  <ol className="space-y-2.5 text-xs text-slate-600">
                    {[
                      'Camera captures 30 face samples at different angles.',
                      'Outlier samples are filtered for quality.',
                      'A weighted average descriptor is computed.',
                      'Only the 128-number vector is saved — no photos stored.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
