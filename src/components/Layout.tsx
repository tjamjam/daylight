import { Outlet } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useTrust } from '../contexts/TrustContext';

export default function Layout() {
  const { isOnline } = useTrust();

  return (
    <div
      className="min-h-screen bg-zinc-900 text-white flex flex-col transition-[filter] duration-700 ease-in-out"
      style={!isOnline ? { filter: 'invert(1) hue-rotate(180deg)' } : undefined}
    >
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            100% client-side. No servers.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-500 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Source</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
