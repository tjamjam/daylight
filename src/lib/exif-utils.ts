import exifr from 'exifr';

export interface MetadataResult {
  gps?: {
    lat: number;
    lng: number;
  };
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    serialNumber?: string;
  };
  settings?: {
    iso?: number;
    aperture?: number;
    shutterSpeed?: string;
    focalLength?: number;
  };
  timestamps?: {
    taken?: Date;
    modified?: Date;
  };
  software?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  rawTags: Record<string, any>;
}

export async function parseFullMetadata(file: File): Promise<MetadataResult> {
  try {
    const data = await exifr.parse(file, {
      xmp: true,
      iptc: true,
      icc: true,
      jfif: true,
      ihdr: true,
      tiff: true,
      gps: true,
      exif: true
    });

    if (!data) {
      return { rawTags: {} };
    }

    const result: MetadataResult = {
      rawTags: data
    };

    // GPS data
    if (data.latitude && data.longitude) {
      result.gps = {
        lat: data.latitude,
        lng: data.longitude
      };
    }

    // Camera info
    if (data.Make || data.Model || data.LensModel || data.SerialNumber) {
      result.camera = {
        make: data.Make,
        model: data.Model,
        lens: data.LensModel || data.LensInfo,
        serialNumber: data.SerialNumber
      };
    }

    // Camera settings
    if (data.ISO || data.FNumber || data.ExposureTime || data.FocalLength) {
      result.settings = {
        iso: data.ISO,
        aperture: data.FNumber,
        shutterSpeed: data.ExposureTime ? `1/${Math.round(1 / data.ExposureTime)}` : undefined,
        focalLength: data.FocalLength
      };
    }

    // Timestamps
    if (data.DateTimeOriginal || data.ModifyDate) {
      result.timestamps = {
        taken: data.DateTimeOriginal ? new Date(data.DateTimeOriginal) : undefined,
        modified: data.ModifyDate ? new Date(data.ModifyDate) : undefined
      };
    }

    // Software
    if (data.Software) {
      result.software = data.Software;
    }

    // Dimensions
    if (data.ImageWidth && data.ImageHeight) {
      result.dimensions = {
        width: data.ImageWidth,
        height: data.ImageHeight
      };
    }

    return result;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return { rawTags: {} };
  }
}

export function getPrivacyScore(metadata: MetadataResult): {
  score: 'high-risk' | 'medium-risk' | 'low-risk';
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for GPS data (highest risk)
  if (metadata.gps) {
    reasons.push('Contains GPS location data revealing exact coordinates');
    return { score: 'high-risk', reasons };
  }

  // Check for identifying information
  if (metadata.camera?.serialNumber) {
    reasons.push('Contains camera serial number that can identify your device');
  }

  if (metadata.camera?.make || metadata.camera?.model) {
    reasons.push('Contains camera make/model information');
  }

  if (metadata.timestamps?.taken) {
    reasons.push('Contains timestamp revealing when photo was taken');
  }

  if (metadata.software) {
    reasons.push('Contains software information revealing editing tools used');
  }

  // Determine risk level
  if (reasons.length >= 2) {
    return { score: 'medium-risk', reasons };
  }

  if (reasons.length === 1) {
    return { score: 'medium-risk', reasons };
  }

  reasons.push('Minimal metadata detected');
  return { score: 'low-risk', reasons };
}

export function formatGpsCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}
