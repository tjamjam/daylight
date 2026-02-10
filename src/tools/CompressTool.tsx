import { useState, useEffect } from 'react';
import { FileDown, Download } from 'lucide-react';

import FileDropzone from '../components/FileDropzone';
import ToolHeader from '../components/ToolHeader';
import { compressImage, formatFileSize, downloadFile, getImageDimensions } from '../lib/image-utils';
import { useTrust } from '../contexts/TrustContext';

type FormatType = 'jpeg' | 'webp' | 'png';

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<FormatType>('webp');
  const [quality, setQuality] = useState(80);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const { incrementPhotosProcessed } = useTrust();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setCompressedBlob(null);
    incrementPhotosProcessed();

    try {
      const dims = await getImageDimensions(selectedFile);
      setDimensions(dims);
    } catch (error) {
      console.error('Error getting dimensions:', error);
    }
  };

  useEffect(() => {
    if (!file) return;

    const compress = async () => {
      setCompressing(true);
      try {
        const result = await compressImage(file, quality, format);
        setCompressedBlob(result.blob);
        setEstimatedSize(result.blob.size);
      } catch (error) {
        console.error('Error compressing:', error);
      } finally {
        setCompressing(false);
      }
    };

    const debounce = setTimeout(compress, 300);
    return () => clearTimeout(debounce);
  }, [file, quality, format]);

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const extension = format === 'jpeg' ? 'jpg' : format;
    const filename = file.name.replace(/\.[^/.]+$/, '') + `_compressed.${extension}`;
    downloadFile(compressedBlob, filename);
  };

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Compress & Convert"
          description="Reduce file size and convert between formats"
          icon={FileDown}
        />
        <div className="max-w-3xl mx-auto">
          <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
        </div>
      </div>
    );
  }

  const originalSize = file.size;
  const compressedSize = estimatedSize || 0;
  const savings = originalSize - compressedSize;
  const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <ToolHeader
        title="Compress & Convert"
        description="Reduce file size and convert between formats"
        icon={FileDown}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Preview */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full max-h-96 object-contain rounded-lg bg-zinc-900"
          />
          {dimensions && (
            <p className="mt-2 text-sm text-zinc-400 text-center">
              {dimensions.width} × {dimensions.height} pixels
            </p>
          )}
        </div>

        {/* Format Selection */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Output Format</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setFormat('jpeg')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'jpeg'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <p className="font-semibold text-white">JPEG</p>
              <p className="text-xs text-zinc-400 mt-1">Best for photos</p>
            </button>
            <button
              onClick={() => setFormat('webp')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'webp'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <p className="font-semibold text-white">WebP</p>
              <p className="text-xs text-zinc-400 mt-1">Best compression</p>
            </button>
            <button
              onClick={() => setFormat('png')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'png'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <p className="font-semibold text-white">PNG</p>
              <p className="text-xs text-zinc-400 mt-1">Lossless quality</p>
            </button>
          </div>
        </div>

        {/* Quality Slider */}
        {format !== 'png' && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Quality</h3>
              <span className="text-2xl font-bold text-amber-500">{quality}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
        )}

        {/* File Size Comparison */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">File Size Comparison</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-2">Original</p>
              <p className="text-3xl font-bold text-white">{formatFileSize(originalSize)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-2">Compressed</p>
              {compressing ? (
                <div className="animate-pulse text-3xl font-bold text-zinc-600">...</div>
              ) : (
                <p className="text-3xl font-bold text-amber-500">{formatFileSize(compressedSize)}</p>
              )}
            </div>
          </div>
          {!compressing && savings > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-700 text-center">
              <p className="text-lg text-zinc-300">
                <span className="text-amber-500 font-bold">{formatFileSize(savings)}</span> smaller
                <span className="text-zinc-500 ml-2">({savingsPercent}% reduction)</span>
              </p>
            </div>
          )}
          {!compressing && savings < 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-700 text-center">
              <p className="text-sm text-zinc-500">
                Note: The compressed file is larger due to format conversion or high quality setting
              </p>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={compressing || !compressedBlob}
            className="bg-amber-500 text-zinc-900 px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-lg"
          >
            <Download className="w-6 h-6" />
            Download Compressed Image
          </button>
        </div>
      </div>
    </div>
  );
}
