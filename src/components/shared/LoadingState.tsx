import React from 'react';

export default function LoadingState({ message = 'Loading intelligent telemetry...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-xs font-mono text-cyan-400 tracking-wider animate-pulse">{message}</p>
    </div>
  );
}
