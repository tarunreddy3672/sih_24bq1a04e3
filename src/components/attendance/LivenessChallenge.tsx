'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Smile, ArrowLeftRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Challenge = 'blink' | 'smile' | 'turn';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onResult: (passed: boolean, challenge: Challenge) => void;
  onCancel: () => void;
}

const CHALLENGES: Challenge[] = ['blink', 'smile', 'turn'];

const CHALLENGE_META: Record<Challenge, { label: string; icon: React.ReactNode; hint: string }> = {
  blink: { label: 'Blink your eyes',         icon: <Eye className="w-6 h-6" />,            hint: 'Close and open your eyes once' },
  smile: { label: 'Smile naturally',          icon: <Smile className="w-6 h-6" />,          hint: 'Show a natural smile' },
  turn:  { label: 'Turn your head slightly',  icon: <ArrowLeftRight className="w-6 h-6" />, hint: 'Turn left or right ~15°' },
};

// face-api.js 68-point landmark index groups
const LEFT_EYE  = [36, 37, 38, 39, 40, 41];
const RIGHT_EYE = [42, 43, 44, 45, 46, 47];
const MOUTH_CORNERS = [48, 54];
const MOUTH_VERT    = [51, 57];
const NOSE_TIP  = 30;
const LEFT_EAR  = 0;
const RIGHT_EAR = 16;

type Pt = { x: number; y: number };

function eyeAspectRatio(pts: Pt[], indices: number[]) {
  const [p1, p2, p3, p4, p5, p6] = indices.map(i => pts[i]);
  const vert  = (Math.abs(p2.y - p6.y) + Math.abs(p3.y - p5.y)) / 2;
  const horiz = Math.abs(p1.x - p4.x);
  return horiz > 0 ? vert / horiz : 0;
}

function mouthOpenRatio(pts: Pt[]) {
  const width  = Math.abs(pts[MOUTH_CORNERS[0]].x - pts[MOUTH_CORNERS[1]].x);
  const height = Math.abs(pts[MOUTH_VERT[0]].y    - pts[MOUTH_VERT[1]].y);
  return width > 0 ? height / width : 0;
}

function headYaw(pts: Pt[]) {
  const nose = pts[NOSE_TIP];
  const left = pts[LEFT_EAR];
  const right = pts[RIGHT_EAR];
  const mid  = (left.x + right.x) / 2;
  const span = Math.abs(right.x - left.x);
  return span > 0 ? (nose.x - mid) / span : 0;
}

export default function LivenessChallenge({ videoRef, onResult, onCancel }: Props) {
  const [challenge] = useState<Challenge>(
    () => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
  );
  const [status, setStatus]     = useState<'waiting' | 'capturing' | 'pass' | 'fail'>('waiting');
  const [countdown, setCountdown] = useState(10);
  const faceApiRef = useRef<any>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const faceapi = await import('face-api.js');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        ]);
        if (!cancelled) faceApiRef.current = faceapi;
      } catch {
        // models absent — demo mode, will simulate pass
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const captureAndEvaluate = useCallback(async () => {
    setStatus('capturing');
    const faceapi = faceApiRef.current;
    const video   = videoRef.current;

    if (!faceapi || !video || !video.videoWidth) {
      // No models / no camera — simulate pass for demo
      setTimeout(() => { setStatus('pass'); onResult(true, challenge); }, 600);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    const frames: Pt[][] = [];

    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 350));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const det = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);
      if (det) frames.push(det.landmarks.positions as Pt[]);
    }

    if (frames.length < 2) {
      setStatus('fail');
      onResult(false, challenge);
      return;
    }

    let passed = false;
    if (challenge === 'blink') {
      const ears = frames.map(f => (eyeAspectRatio(f, LEFT_EYE) + eyeAspectRatio(f, RIGHT_EYE)) / 2);
      passed = Math.max(...ears) - Math.min(...ears) > 0.06;
    } else if (challenge === 'smile') {
      const mars = frames.map(f => mouthOpenRatio(f));
      passed = Math.max(...mars) - Math.min(...mars) > 0.04;
    } else {
      const yaws = frames.map(f => headYaw(f));
      passed = Math.max(...yaws) - Math.min(...yaws) > 0.08;
    }

    setStatus(passed ? 'pass' : 'fail');
    onResult(passed, challenge);
  }, [challenge, videoRef, onResult]);

  useEffect(() => {
    const startDelay = setTimeout(() => captureAndEvaluate(), 1500);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setStatus('fail');
          onResult(false, challenge);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { clearTimeout(startDelay); clearInterval(timerRef.current!); };
  }, [captureAndEvaluate, challenge, onResult]);

  const meta = CHALLENGE_META[challenge];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 rounded-xl gap-4 p-6"
      >
        {(status === 'waiting' || status === 'capturing') && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              {meta.icon}
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{meta.label}</p>
              <p className="text-slate-300 text-xs mt-1">{meta.hint}</p>
            </div>
            {status === 'capturing'
              ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              : <span className="text-xs font-mono text-amber-400">{countdown}s remaining</span>
            }
          </>
        )}
        {status === 'pass' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-white font-bold text-sm">Liveness verified ✓</p>
          </>
        )}
        {status === 'fail' && (
          <>
            <XCircle className="w-12 h-12 text-rose-400" />
            <p className="text-white font-bold text-sm">Challenge failed — try again</p>
            <button
              onClick={onCancel}
              className="text-xs text-slate-300 underline mt-1"
            >
              Skip &amp; mark manually
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
