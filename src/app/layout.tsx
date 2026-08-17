import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/shared/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduVision — Smart Academic Intelligence Platform | SIH 2026',
  description: 'Clean, intelligent academic dashboard for student learning, attendance tracking, and institutional insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-[#F8FAFC] text-slate-900 min-h-screen antialiased selection:bg-indigo-500/20 selection:text-indigo-900`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
