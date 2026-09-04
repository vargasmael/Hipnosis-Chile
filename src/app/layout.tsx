import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { Navbar } from '@/components/navigation/Navbar';
import { FloatingPlayer } from '@/components/player/FloatingPlayer';
import { BottomNav } from '@/components/navigation/BottomNav';

export const metadata: Metadata = {
  title: 'Hipnosis Chile - Plataforma de Streaming de Bienestar e Hipnosis',
  description:
    'Membresía digital para relajación profunda, sueño reparador, liberación de estrés y reprogramación mental 24/7.',
  keywords: ['hipnosis chile', 'sueño profundo', 'estrés', 'meditación', 'relajación', 'bienestar'],
  applicationName: 'Hipnosis Chile',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hipnosis Chile',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased bg-slate-950 text-slate-100">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
        <AuthProvider>
          <PlayerProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <FloatingPlayer />
            <BottomNav />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
