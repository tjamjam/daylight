import { useState, useEffect } from 'react';
import { Maximize2, Download, Lock, Unlock } from 'lucide-react';

import FileDropzone from '../components/FileDropzone';
import ToolHeader from '../components/ToolHeader';
import { resizeImage, formatFileSize, downloadFile, getImageDimensions } from '../lib/image-utils';
import { useTrust } from '../contexts/TrustContext';

export default function ResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizing, setResizing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { incrementPhotosProcessed } = useTrust();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResizedBlob(null);
    incrementPhotosProcessed();

    try {
      const dims = await getImageDimensions(selectedFile);
      setOriginalDimensions(dims);
      setWidth(dims.width);
      setHeight(dims.height);
    } catch (error) {
      console.error('Error getting dimensions:', error);
    }
  };

  useEffect(() => {
    if (!file || !originalDimensions) return;

    const resize = async () => {
      setResizing(true);
      try {
        const blob = await resizeImage(file, width, height, maintainAspect);
        setResizedBlob(blob);
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
      } catch (error) {
        console.error('Error resizing:', error);
      } finally {
        setResizing(false);
      }
    };

    const debounce = setTimeout(resize, 300);
    return () => clearTimeout(debounce);
  }, [file, width, height, maintainAspect]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const applyPreset = (presetWidth: number) => {
    if (!originalDimensions) return;
    const aspectRatio = originalDimensions.width / originalDimensions.height;
    setWidth(presetWidth);
    setHeight(Math.round(presetWidth / aspectRatio));
  };

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const filename = file.name.replace(/\.[^/.]+$/, '') + `_${width}x${height}.jpg`;
    downloadFile(resizedBlob, filename);
  };

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Resize Images"
          description="Scale images for web, email, social media, or custom dimensions"
          icon={Maximize2}
        />
        <div className="max-w-3xl mx-auto">
          <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ToolHeader
        title="Resize Images"
        description="Scale images for web, email, social media, or custom dimensions"
        icon={Maximize2}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Current Dimensions */}
        {originalDimensions && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Current Size</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{originalDimensions.width}</p>
                <p className="text-sm text-zinc-500">Width (px)</p>
              </div>
              <span className="text-2xl text-zinc-600">×</span>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{originalDimensions.height}</p>
                <p className="text-sm text-zinc-500">Height (px)</p>
              </div>
              <div className="ml-8 text-center">
                <p className="text-lg text-zinc-400">{formatFileSize(file.size)}</p>
                <p className="text-sm text-zinc-500">File size</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => applyPreset(1200)}
              className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <p className="font-semibold text-white">Web</p>
              <p className="text-sm text-zinc-400">1200px wide</p>
            </button>
            <button
              onClick={() => applyPreset(800)}
              className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <p className="font-semibold text-white">Email</p>
              <p className="text-sm text-zinc-400">800px wide</p>
            </button>
            <button
              onClick={() => applyPreset(1080)}
              className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <p className="font-semibold text-white">Social</p>
              <p className="text-sm text-zinc-400">1080px wide</p>
            </button>
            <button
              onClick={() => applyPreset(300)}
              className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <p className="font-semibold text-white">Thumbnail</p>
              <p className="text-sm text-zinc-400">300px wide</p>
            </button>
          </div>
        </div>

        {/* Custom Dimensions */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Custom Dimensions</h3>
            <button
              onClick={() => setMaintainAspect(!maintainAspect)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-500 transition-colors"
            >
              {maintainAspect ? (
                <>
                  <Lock className="w-4 h-4" />
                  Aspect ratio locked
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Aspect ratio unlocked
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
          {resizing ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
          ) : previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="Resized preview"
                className="w-full max-h-96 object-contain rounded-lg bg-zinc-900"
              />
              <div className="mt-4 text-center text-sm text-zinc-400">
                {width} × {height} pixels
                {resizedBlob && (
                  <span className="ml-4">
                    {formatFileSize(resizedBlob.size)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-zinc-500">
              Preview will appear here
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={resizing || !resizedBlob}
            className="bg-amber-500 text-zinc-900 px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-lg"
          >
            <Download className="w-6 h-6" />
            Download Resized Image
          </button>
        </div>
      </div>
    </div>
  );
}
