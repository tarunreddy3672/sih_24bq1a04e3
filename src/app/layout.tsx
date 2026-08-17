import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/shared/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduVision AI — Smart Education Intelligence Platform | SIH 2026',
  description: 'AI-Powered Education Dashboard, Attendance Intelligence, Adaptive Learning, and Institutional Control Tower.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} bg-[#070B14] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
