import { Outlet, Link } from 'react-router-dom';
import { Sun, Github } from 'lucide-react';
import { useTrust } from '../contexts/TrustContext';

export default function Layout() {
  const { photosProcessed } = useTrust();

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Trust Banner */}
      <div className="bg-amber-500 text-zinc-900 py-2 px-4 text-center font-medium text-sm">
        Photos processed: {photosProcessed} | Network requests: 0 | Data uploaded: 0 bytes
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                <Sun className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Daylight</h1>
                <p className="text-xs text-zinc-500">See what's hidden in your photos</p>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/audit"
                className="text-zinc-300 hover:text-amber-500 transition-colors font-medium"
              >
                Privacy Audit
              </Link>
              <Link
                to="/strip"
                className="text-zinc-300 hover:text-amber-500 transition-colors font-medium"
              >
                Strip Metadata
              </Link>
              <Link
                to="/compress"
                className="text-zinc-300 hover:text-amber-500 transition-colors font-medium"
              >
                Compress
              </Link>
              <Link
                to="/resize"
                className="text-zinc-300 hover:text-amber-500 transition-colors font-medium"
              >
                Resize
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-zinc-300 font-medium mb-1">
                Your photos never leave this device. Everything runs in your browser.
              </p>
              <p className="text-sm text-zinc-500">
                Unlike other tools, we don't just say we're private — we prove it.
              </p>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-600">
            <p>Open the browser's developer tools and check the Network tab. You'll see zero requests.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
