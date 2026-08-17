import React from 'react';

export default function LoadingState({ message = 'Loading academic records...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-10 h-10 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
}
