'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AccessibilityProvider() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch('/api/user-settings')
      .then(r => r.json())
      .then(({ settings }) => {
        if (!settings) return;
        const html = document.documentElement;

        // Language
        if (settings.languagePreference) {
          html.setAttribute('lang', settings.languagePreference);
        }

        const a = settings.accessibilitySettings || {};

        // Font size
        const sizeMap: Record<string, string> = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
        html.style.fontSize = sizeMap[a.fontSize] || '16px';

        // High contrast
        html.classList.toggle('high-contrast', !!a.highContrast);

        // Reduced motion
        html.classList.toggle('reduce-motion', !!a.reducedMotion);
      })
      .catch(() => {});
  }, [status]);

  return null;
}
