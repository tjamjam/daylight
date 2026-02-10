import { useState } from 'react';
import { ShieldCheck, Download, CheckCircle } from 'lucide-react';

import FileDropzone from '../components/FileDropzone';
import ToolHeader from '../components/ToolHeader';
import { parseFullMetadata, formatGpsCoordinates } from '../lib/exif-utils';
import type { MetadataResult } from '../lib/exif-utils';
import { stripMetadata, formatFileSize, downloadFile } from '../lib/image-utils';
import { useTrust } from '../contexts/TrustContext';

export default function StripTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const { incrementPhotosProcessed } = useTrust();

  const [options, setOptions] = useState({
    removeGps: true,
    removeCamera: true,
    removeTimestamps: true,
    keepOrientation: true,
  });

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setCleanedBlob(null);
    setLoading(true);

    try {
      const result = await parseFullMetadata(selectedFile);
      setMetadata(result);
      incrementPhotosProcessed();
    } catch (error) {
      console.error('Error parsing metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const blob = await stripMetadata(file, { keepOrientation: options.keepOrientation });
      setCleanedBlob(blob);
    } catch (error) {
      console.error('Error cleaning image:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedBlob || !file) return;
    const filename = `cleaned_${file.name}`;
    downloadFile(cleanedBlob, filename);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Strip Metadata"
          description="Remove privacy-sensitive information from your photos"
          icon={ShieldCheck}
        />
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Analyzing your photo...</p>
        </div>
      </div>
    );
  }

  if (!file || !metadata) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Strip Metadata"
          description="Remove privacy-sensitive information from your photos"
          icon={ShieldCheck}
        />
        <div className="max-w-3xl mx-auto">
          <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
        </div>
      </div>
    );
  }

  if (cleanedBlob) {
    const originalSize = file.size;
    const cleanedSize = cleanedBlob.size;
    const savings = originalSize - cleanedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);

    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Strip Metadata"
          description="Remove privacy-sensitive information from your photos"
          icon={ShieldCheck}
        />

        <div className="max-w-3xl mx-auto">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Photo Cleaned Successfully</h2>
            <p className="text-zinc-300 mb-6">
              All metadata has been removed from your photo.
            </p>

            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Original Size</p>
                  <p className="text-white text-lg font-semibold">{formatFileSize(originalSize)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Cleaned Size</p>
                  <p className="text-white text-lg font-semibold">{formatFileSize(cleanedSize)}</p>
                </div>
              </div>
              {savings > 0 && (
                <p className="mt-4 text-amber-500 font-medium">
                  {formatFileSize(savings)} smaller ({savingsPercent}% reduction)
                </p>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="bg-amber-500 text-zinc-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Cleaned Photo
            </button>

            <button
              onClick={() => {
                setFile(null);
                setMetadata(null);
                setCleanedBlob(null);
              }}
              className="ml-4 text-zinc-400 hover:text-white transition-colors"
            >
              Clean another photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ToolHeader
        title="Strip Metadata"
        description="Remove privacy-sensitive information from your photos"
        icon={ShieldCheck}
      />

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Before */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Current Metadata</h3>
            <div className="space-y-4">
              {metadata.gps && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-500 mb-1">GPS Location</p>
                  <p className="text-sm text-zinc-300">
                    {formatGpsCoordinates(metadata.gps.lat, metadata.gps.lng)}
                  </p>
                </div>
              )}

              {metadata.camera && (
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-zinc-400 mb-1">Camera Info</p>
                  <p className="text-sm text-zinc-300">
                    {metadata.camera.make} {metadata.camera.model}
                  </p>
                  {metadata.camera.lens && (
                    <p className="text-xs text-zinc-400 mt-1">{metadata.camera.lens}</p>
                  )}
                </div>
              )}

              {metadata.timestamps && (
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-zinc-400 mb-1">Timestamps</p>
                  {metadata.timestamps.taken && (
                    <p className="text-sm text-zinc-300">
                      Taken: {metadata.timestamps.taken.toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-zinc-700/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-zinc-400 mb-1">File Size</p>
                <p className="text-sm text-zinc-300">{formatFileSize(file.size)}</p>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">After Cleaning</h3>
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-500 mb-1">GPS Location</p>
                <p className="text-sm text-zinc-300">Removed</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-500 mb-1">Camera Info</p>
                <p className="text-sm text-zinc-300">Removed</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-500 mb-1">Timestamps</p>
                <p className="text-sm text-zinc-300">Removed</p>
              </div>

              <div className="bg-zinc-700/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-zinc-400 mb-1">File Size</p>
                <p className="text-sm text-zinc-300">Similar (metadata is small)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Cleaning Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeGps}
                onChange={(e) => setOptions({ ...options, removeGps: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-zinc-300">Remove GPS location data</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeCamera}
                onChange={(e) => setOptions({ ...options, removeCamera: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-zinc-300">Remove camera information</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeTimestamps}
                onChange={(e) => setOptions({ ...options, removeTimestamps: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-zinc-300">Remove timestamps</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.keepOrientation}
                onChange={(e) => setOptions({ ...options, keepOrientation: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-zinc-300">Keep image orientation (recommended)</span>
            </label>
          </div>
        </div>

        {/* Clean Button */}
        <div className="text-center">
          <button
            onClick={handleClean}
            disabled={processing}
            className="bg-amber-500 text-zinc-900 px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full"></div>
                Cleaning...
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6" />
                Clean Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
