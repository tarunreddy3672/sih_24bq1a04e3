import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/shared/SessionProvider';
import AccessibilityProvider from '@/components/shared/AccessibilityProvider';
import { LangProvider } from '@/lib/i18n';
import ServiceWorkerRegistrar from '@/components/shared/ServiceWorkerRegistrar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduVision — Smart Academic Intelligence Platform | SIH 2026',
  description: 'Clean, intelligent academic dashboard for student learning, attendance tracking, and institutional insights.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'EduVision' },
};

export const viewport: Viewport = {
  themeColor: '#3E4C8A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3E4C8A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduVision" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.className} bg-[#F8FAFC] text-slate-900 min-h-screen antialiased selection:bg-indigo-500/20 selection:text-indigo-900`}>
        <SessionProvider>
          <LangProvider>
            <AccessibilityProvider />
            <ServiceWorkerRegistrar />
            {children}
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
