import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  selectedFile?: File | null;
}

export default function FileDropzone({
  onFileSelect,
  acceptedTypes = 'image/*',
  selectedFile
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      onFileSelect(imageFile);
      const url = URL.createObjectURL(imageFile);
      setPreview(url);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }, [onFileSelect]);

  if (preview && selectedFile) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-contain rounded-lg bg-zinc-800"
        />
        <button
          onClick={() => {
            setPreview(null);
            URL.revokeObjectURL(preview);
          }}
          className="absolute top-2 right-2 bg-zinc-900/90 text-white px-3 py-1 rounded text-sm hover:bg-zinc-800"
        >
          Change
        </button>
        <div className="mt-2 text-sm text-zinc-400">
          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
        ${isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-700 hover:border-zinc-600'}
      `}
    >
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
      <p className="text-lg text-zinc-300 mb-2">
        Drop an image here or click to browse
      </p>
      <p className="text-sm text-zinc-500">
        Supports JPG, PNG, WebP, and other common formats
      </p>
    </div>
  );
}
