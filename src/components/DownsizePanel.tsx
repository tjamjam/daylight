import { useState, useCallback, useRef } from 'react';
import { Check, X, Loader2, Trash2, Upload } from 'lucide-react';
import { downsizeImage, downloadFile, formatFileSize, type DownsizeSettings } from '../lib/image-utils';
import { useTrust } from '../contexts/TrustContext';

interface ProcessedEntry {
  id: string;
  fileName: string;
  originalSize: number;
  newSize: number;
  originalDimensions: string;
  newDimensions: string;
  status: 'processing' | 'done' | 'error';
  errorMessage?: string;
}

const presets = [
  { label: '4K', width: 3840, height: 2160 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: 'Thumbnail', width: 300, height: 300 },
] as const;

export default function DownsizePanel() {
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [log, setLog] = useState<ProcessedEntry[]>([]);
  const [processingCount, setProcessingCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const idCounter = useRef(0);
  const { incrementPhotosProcessed } = useTrust();

  const settingsRef = useRef<DownsizeSettings>({ maxWidth, maxHeight, quality, format });
  settingsRef.current = { maxWidth, maxHeight, quality, format };

  const processFiles = useCallback(async (files: File[]) => {
    const settings = { ...settingsRef.current };
    const needsDelay = files.length >= 5;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = String(++idCounter.current);

      const entry: ProcessedEntry = {
        id,
        fileName: file.name,
        originalSize: file.size,
        newSize: 0,
        originalDimensions: '',
        newDimensions: '',
        status: 'processing',
      };

      setLog((prev) => [...prev, entry]);
      setProcessingCount((c) => c + 1);

      try {
        const result = await downsizeImage(file, settings);
        incrementPhotosProcessed();

        setLog((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'done' as const,
                  newSize: result.newSize,
                  originalDimensions: `${result.originalWidth}×${result.originalHeight}`,
                  newDimensions: `${result.newWidth}×${result.newHeight}`,
                }
              : e
          )
        );

        downloadFile(result.blob, result.fileName);

        if (needsDelay && i < files.length - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch (err) {
        setLog((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'error' as const,
                  errorMessage: err instanceof Error ? err.message : 'Unknown error',
                }
              : e
          )
        );
      } finally {
        setProcessingCount((c) => c - 1);
      }
    }
  }, [incrementPhotosProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) processFiles(files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
    e.target.value = '';
  }, [processFiles]);

  const clearLog = () => setLog([]);

  const doneEntries = log.filter((e) => e.status === 'done');
  const totalOriginal = doneEntries.reduce((s, e) => s + e.originalSize, 0);
  const totalNew = doneEntries.reduce((s, e) => s + e.newSize, 0);
  const savingsPercent =
    totalOriginal > 0 ? Math.round((1 - totalNew / totalOriginal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Drop zone (left) + Settings (right) */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Drop zone — takes 3 cols */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`lg:col-span-3 relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors min-h-[320px] ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-14 h-14 mb-4 text-zinc-500" />
          <p className="text-xl font-semibold text-zinc-200 mb-1">Drop images here</p>
          <p className="text-sm text-zinc-400">
            JPG, PNG, and WebP. Auto-resized and downloaded instantly.
          </p>
        </div>

        {/* Settings — takes 2 cols */}
        <div className="lg:col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-300 mb-1">Max width</label>
              <input
                type="number"
                min={1}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value) || 1)}
                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-amber-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-300 mb-1">Max height</label>
              <input
                type="number"
                min={1}
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value) || 1)}
                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-amber-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Format toggles */}
          <div>
            <label className="block text-xs text-zinc-300 mb-1">Format</label>
            <div className="flex gap-2">
              {[
                { value: 'image/jpeg' as const, label: 'JPEG' },
                { value: 'image/webp' as const, label: 'WebP' },
                { value: 'image/png' as const, label: 'PNG' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    format === opt.value
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-zinc-600 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider — hidden for PNG */}
          {format !== 'image/png' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-zinc-300">Quality</label>
                <span className="text-xs font-bold text-amber-500">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-zinc-300 mt-0.5">
                <span>Smaller</span>
                <span>Better</span>
              </div>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-xs text-zinc-300 mb-1">Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setMaxWidth(p.width);
                    setMaxHeight(p.height);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    maxWidth === p.width && maxHeight === p.height
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Log */}
      {log.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Processing Log</h3>
            <button
              onClick={clearLog}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
            {log.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5">
                  {entry.status === 'processing' && (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  )}
                  {entry.status === 'done' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {entry.status === 'error' && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {entry.fileName}
                    {entry.status === 'done' && entry.originalDimensions && (
                      <span className="ml-2 font-normal text-zinc-300">
                        {entry.originalDimensions} → {entry.newDimensions}
                      </span>
                    )}
                  </p>
                  {entry.status === 'processing' && (
                    <p className="text-xs text-zinc-400">Processing…</p>
                  )}
                  {entry.status === 'done' && (
                    <p className="text-xs text-zinc-400">
                      {formatFileSize(entry.originalSize)} → {formatFileSize(entry.newSize)}
                      {entry.originalSize > 0 && (
                        <span className="ml-1 text-green-500">
                          ({Math.round((1 - entry.newSize / entry.originalSize) * 100)}%
                          smaller)
                        </span>
                      )}
                    </p>
                  )}
                  {entry.status === 'error' && (
                    <p className="text-xs text-red-400">{entry.errorMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {doneEntries.length >= 2 && (
            <p className="text-sm text-zinc-300 mt-3 text-center">
              Total: {formatFileSize(totalOriginal)} → {formatFileSize(totalNew)}{' '}
              <span className="text-green-500">({savingsPercent}% saved)</span>
            </p>
          )}
        </div>
      )}

      {processingCount > 0 && log.length === 0 && (
        <div className="text-center text-sm text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
          Processing…
        </div>
      )}
    </div>
  );
}
