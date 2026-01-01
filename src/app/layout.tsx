import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DebugPanel } from '@/debug/DebugPanel';

const inter = localFont({
  src: [
    { path: '../../public/fonts/inter-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/inter-600.ttf', weight: '600', style: 'normal' }
  ],
  variable: '--font-inter',
  display: 'swap'
});

const spaceGrotesk = localFont({
  src: [
    { path: '../../public/fonts/space-grotesk-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/space-grotesk-600.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/space-grotesk-700.ttf', weight: '700', style: 'normal' }
  ],
  variable: '--font-space',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Persona Platform',
  description: 'Multi-tenant agentic AI workspace platform'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <DebugPanel />
      </body>
    </html>
  );
}
