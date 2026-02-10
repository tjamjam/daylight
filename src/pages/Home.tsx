import { Link } from 'react-router-dom';
import { ScanSearch, ShieldCheck, FileDown, Maximize2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Bring your photo data to light
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          See what metadata is hiding in your photos — GPS location, camera info, timestamps.
          Then strip it, compress, convert, and resize. Everything happens in your browser.
          Nothing leaves your device.
        </p>
      </div>

      {/* Tool Grid */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-16">
        {/* Privacy Audit - Hero Feature */}
        <Link
          to="/audit"
          className="group relative bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50 rounded-xl p-6 hover:border-amber-500 transition-all hover:shadow-xl hover:shadow-amber-500/20"
        >
          <div className="absolute top-4 right-4">
            <span className="bg-amber-500 text-zinc-900 text-xs font-bold px-2 py-1 rounded">
              FEATURED
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg w-fit mb-4">
            <ScanSearch className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Privacy Audit</h3>
          <p className="text-zinc-400">
            See what's hidden in your photos. GPS location, camera details, and more.
          </p>
        </Link>

        {/* Metadata Strip */}
        <Link
          to="/strip"
          className="group bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-amber-500/50 transition-all hover:bg-zinc-800/80"
        >
          <div className="p-3 bg-zinc-700/50 rounded-lg w-fit mb-4">
            <ShieldCheck className="w-8 h-8 text-zinc-300 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Clean Your Photos</h3>
          <p className="text-zinc-400">
            Strip metadata and privacy-sensitive information from your images.
          </p>
        </Link>

        {/* Compress & Convert */}
        <Link
          to="/compress"
          className="group bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-amber-500/50 transition-all hover:bg-zinc-800/80"
        >
          <div className="p-3 bg-zinc-700/50 rounded-lg w-fit mb-4">
            <FileDown className="w-8 h-8 text-zinc-300 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Compress & Convert</h3>
          <p className="text-zinc-400">
            Reduce file size and convert between formats. JPEG, WebP, PNG.
          </p>
        </Link>

        {/* Resize */}
        <Link
          to="/resize"
          className="group bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-amber-500/50 transition-all hover:bg-zinc-800/80"
        >
          <div className="p-3 bg-zinc-700/50 rounded-lg w-fit mb-4">
            <Maximize2 className="w-8 h-8 text-zinc-300 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Resize Images</h3>
          <p className="text-zinc-400">
            Scale images for web, email, social media, or custom dimensions.
          </p>
        </Link>
      </div>

      {/* How is this different section */}
      <div className="max-w-4xl mx-auto bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">How is this different?</h2>
        <div className="space-y-4 text-zinc-300 leading-relaxed">
          <p>
            <span className="text-amber-500 font-semibold">Most image tools upload your photos to their servers.</span> Even if they say they don't.
          </p>
          <p>
            Daylight processes everything in your browser using modern web technology.
            Your photos never touch our servers — because we don't have any.
          </p>
          <p>
            Don't take our word for it. <span className="text-amber-500 font-semibold">Check the network tab in your browser's developer tools.</span> You'll see zero requests.
          </p>
        </div>
      </div>
    </div>
  );
}
