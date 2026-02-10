import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ScanSearch, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import FileDropzone from '../components/FileDropzone';
import ToolHeader from '../components/ToolHeader';
import { parseFullMetadata, getPrivacyScore, formatGpsCoordinates } from '../lib/exif-utils';
import type { MetadataResult } from '../lib/exif-utils';
import { useTrust } from '../contexts/TrustContext';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function AuditTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const { incrementPhotosProcessed } = useTrust();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ToolHeader
          title="Privacy Audit"
          description="Analyze what metadata is embedded in your photo"
          icon={ScanSearch}
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
          title="Privacy Audit"
          description="Analyze what metadata is embedded in your photo"
          icon={ScanSearch}
        />
        <div className="max-w-3xl mx-auto">
          <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
        </div>
      </div>
    );
  }

  const privacyScore = getPrivacyScore(metadata);

  const scoreColors = {
    'high-risk': 'bg-red-500/20 border-red-500 text-red-500',
    'medium-risk': 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
    'low-risk': 'bg-green-500/20 border-green-500 text-green-500',
  };

  const scoreLabels = {
    'high-risk': 'HIGH RISK',
    'medium-risk': 'MEDIUM RISK',
    'low-risk': 'LOW RISK',
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <ToolHeader
        title="Privacy Audit"
        description="Analyze what metadata is embedded in your photo"
        icon={ScanSearch}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Privacy Score */}
        <div className={`border-2 rounded-xl p-6 ${scoreColors[privacyScore.score]}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Privacy Score</h2>
            <span className="text-xl font-bold">{scoreLabels[privacyScore.score]}</span>
          </div>
          <ul className="space-y-2">
            {privacyScore.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* GPS Map */}
        {metadata.gps && (
          <div className="bg-zinc-800 border border-red-500 rounded-xl p-6">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-bold text-red-500 mb-1">Location Data Found</h3>
                  <p className="text-zinc-300">
                    This photo reveals your exact location: {formatGpsCoordinates(metadata.gps.lat, metadata.gps.lng)}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64 rounded-lg overflow-hidden">
              <MapContainer
                center={[metadata.gps.lat, metadata.gps.lng]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[metadata.gps.lat, metadata.gps.lng]}>
                  <Popup>Photo taken here</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Camera Info */}
        {metadata.camera && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Camera Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {metadata.camera.make && (
                <div>
                  <p className="text-sm text-zinc-500">Make</p>
                  <p className="text-zinc-300">{metadata.camera.make}</p>
                </div>
              )}
              {metadata.camera.model && (
                <div>
                  <p className="text-sm text-zinc-500">Model</p>
                  <p className="text-zinc-300">{metadata.camera.model}</p>
                </div>
              )}
              {metadata.camera.lens && (
                <div>
                  <p className="text-sm text-zinc-500">Lens</p>
                  <p className="text-zinc-300">{metadata.camera.lens}</p>
                </div>
              )}
              {metadata.camera.serialNumber && (
                <div>
                  <p className="text-sm text-zinc-500">Serial Number</p>
                  <p className="text-zinc-300 font-mono">{metadata.camera.serialNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {metadata.settings && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Camera Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metadata.settings.iso && (
                <div>
                  <p className="text-sm text-zinc-500">ISO</p>
                  <p className="text-zinc-300">{metadata.settings.iso}</p>
                </div>
              )}
              {metadata.settings.aperture && (
                <div>
                  <p className="text-sm text-zinc-500">Aperture</p>
                  <p className="text-zinc-300">f/{metadata.settings.aperture}</p>
                </div>
              )}
              {metadata.settings.shutterSpeed && (
                <div>
                  <p className="text-sm text-zinc-500">Shutter Speed</p>
                  <p className="text-zinc-300">{metadata.settings.shutterSpeed}s</p>
                </div>
              )}
              {metadata.settings.focalLength && (
                <div>
                  <p className="text-sm text-zinc-500">Focal Length</p>
                  <p className="text-zinc-300">{metadata.settings.focalLength}mm</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        {metadata.timestamps && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Timestamps</h3>
            <div className="space-y-3">
              {metadata.timestamps.taken && (
                <div>
                  <p className="text-sm text-zinc-500">Date Taken</p>
                  <p className="text-zinc-300">{metadata.timestamps.taken.toLocaleString()}</p>
                </div>
              )}
              {metadata.timestamps.modified && (
                <div>
                  <p className="text-sm text-zinc-500">Date Modified</p>
                  <p className="text-zinc-300">{metadata.timestamps.modified.toLocaleString()}</p>
                </div>
              )}
              <p className="text-sm text-zinc-500 mt-2">
                Timestamps can reveal when and potentially where you were when the photo was taken.
              </p>
            </div>
          </div>
        )}

        {/* Software */}
        {metadata.software && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Software</h3>
            <p className="text-zinc-300">{metadata.software}</p>
            <p className="text-sm text-zinc-500 mt-2">
              Software information reveals what tools were used to capture or edit this photo.
            </p>
          </div>
        )}

        {/* Raw Metadata */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-xl font-bold text-white">Full Metadata</h3>
            {showRawData ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {showRawData && (
            <div className="mt-4 bg-zinc-900 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-zinc-400 font-mono">
                {JSON.stringify(metadata.rawTags, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Want to remove this metadata?</h3>
          <p className="text-zinc-400 mb-4">
            Use our metadata stripping tool to clean your photos before sharing them.
          </p>
          <Link
            to="/strip"
            className="inline-block bg-amber-500 text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
          >
            Strip Metadata
          </Link>
        </div>
      </div>
    </div>
  );
}
