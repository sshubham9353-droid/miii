import type { ReactNode } from 'react';
import OceanBackground from './OceanBackground';
import TopNavbar from './TopNavbar';
import ToastContainer from './ToastContainer';
import { useLibrary } from '@/context/LibraryContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { settings } = useLibrary();
  return (
    <div className="theme-root relative isolate min-h-[100dvh]" data-theme={settings.backgroundMode} data-palette={settings.accentPalette || 'lagoon'}>
      <OceanBackground mode={settings.backgroundMode} />
      <TopNavbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
