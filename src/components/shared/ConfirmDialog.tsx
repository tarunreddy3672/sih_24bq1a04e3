'use client';

import React from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isDangerous ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
        }`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-300 pt-1">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-medium text-white transition-all shadow-md ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-cyan-500/20'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
