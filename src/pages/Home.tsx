import { Link } from 'react-router-dom';
import { Sun, ScanSearch, ShieldCheck, FileDown, Maximize2 } from 'lucide-react';
import NetworkMonitor from '../components/NetworkMonitor';
import DownsizePanel from '../components/DownsizePanel';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Sun className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Daylight
            </h1>
          </div>
          <p className="text-lg text-zinc-400">
            No upload. No account. Runs entirely in your browser.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <DownsizePanel />
        </div>
      </div>

      {/* Privacy proof */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-800/80 to-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Zero network requests
            </h2>
            <p className="text-zinc-400">
              Your images never leave this device. Verify it below, or turn off your Wi-Fi — everything still works.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <NetworkMonitor />
          </div>
        </div>
      </div>

      {/* More tools — compact */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-zinc-400 text-center mb-6">More tools — all client-side, all free</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/audit"
              className="group bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <ScanSearch className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors mb-1.5" />
              <p className="text-sm font-medium text-zinc-300">Privacy Audit</p>
            </Link>

            <Link
              to="/strip"
              className="group bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors mb-1.5" />
              <p className="text-sm font-medium text-zinc-300">Strip Metadata</p>
            </Link>

            <Link
              to="/compress"
              className="group bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <FileDown className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors mb-1.5" />
              <p className="text-sm font-medium text-zinc-300">Compress</p>
            </Link>

            <Link
              to="/resize"
              className="group bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors mb-1.5" />
              <p className="text-sm font-medium text-zinc-300">Resize</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
