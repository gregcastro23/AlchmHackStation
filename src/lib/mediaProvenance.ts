export interface CaptureSegmentProof {
  sequence: number;
  capturedAt: string;
  bytes: number;
  sha256: string;
  previousChainHash: string | null;
  chainHash: string;
}

export interface CaptureLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

export interface CaptureDeviceContext {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  camera: {
    label: string;
    width?: number;
    height?: number;
    frameRate?: number;
    facingMode?: string;
  };
}

export interface MediaProvenanceManifest {
  schema: 'alchm.media-provenance.v1';
  captureId: string;
  createdAt: string;
  completedAt: string;
  durationSeconds: number;
  media: {
    filename: string;
    mimeType: string;
    bytes: number;
    sha256: string;
  };
  captureProof: {
    strategy: 'hash-chained-mediarecorder-segments';
    segmentIntervalMs: number;
    segmentCount: number;
    finalChainHash: string | null;
    segments: CaptureSegmentProof[];
    note: string;
  };
  context: {
    device: CaptureDeviceContext;
    location: CaptureLocation | null;
    locationConsent: boolean;
    biometricCredentialBindingHash: string;
  };
  anchor: {
    status: 'UNANCHORED';
    payloadSha256: string;
    compatibleTargets: Array<{
      provider: string;
      integration: string;
      status: 'NOT_CONNECTED';
    }>;
  };
  claims: string[];
}

const bytesToHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');

export const sha256 = async (value: Blob | string) => {
  const input = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(await value.arrayBuffer());
  const digest = await window.crypto.subtle.digest('SHA-256', input);
  return bytesToHex(digest);
};

export const hashCaptureSegment = async (
  blob: Blob,
  sequence: number,
  capturedAt: string,
  previousChainHash: string | null,
): Promise<CaptureSegmentProof> => {
  const segmentHash = await sha256(blob);
  const chainHash = await sha256(`${previousChainHash ?? 'GENESIS'}:${sequence}:${capturedAt}:${blob.size}:${segmentHash}`);
  return {
    sequence,
    capturedAt,
    bytes: blob.size,
    sha256: segmentHash,
    previousChainHash,
    chainHash,
  };
};

export const getCaptureDeviceContext = (stream: MediaStream): CaptureDeviceContext => {
  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack?.getSettings();
  const navigatorWithClientHints = navigator as Navigator & { userAgentData?: { platform?: string } };
  return {
    userAgent: navigator.userAgent,
    platform: navigatorWithClientHints.userAgentData?.platform ?? navigator.platform ?? 'unknown',
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio,
    },
    camera: {
      label: videoTrack?.label || 'permissioned camera',
      width: settings?.width,
      height: settings?.height,
      frameRate: settings?.frameRate,
      facingMode: settings?.facingMode,
    },
  };
};

export const buildMediaProvenanceManifest = async ({
  captureId,
  startedAt,
  completedAt,
  filename,
  media,
  segments,
  device,
  location,
  locationConsent,
  biometricCredentialId,
}: {
  captureId: string;
  startedAt: number;
  completedAt: number;
  filename: string;
  media: Blob;
  segments: CaptureSegmentProof[];
  device: CaptureDeviceContext;
  location: CaptureLocation | null;
  locationConsent: boolean;
  biometricCredentialId: string;
}): Promise<MediaProvenanceManifest> => {
  const mediaHash = await sha256(media);
  const biometricCredentialBindingHash = await sha256(biometricCredentialId);
  const payload = {
    captureId,
    createdAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    mediaSha256: mediaHash,
    finalChainHash: segments.at(-1)?.chainHash ?? null,
    device,
    location,
    biometricCredentialBindingHash,
  };
  const payloadSha256 = await sha256(JSON.stringify(payload));

  return {
    schema: 'alchm.media-provenance.v1',
    captureId,
    createdAt: payload.createdAt,
    completedAt: payload.completedAt,
    durationSeconds: Math.max(1, Math.round((completedAt - startedAt) / 1000)),
    media: {
      filename,
      mimeType: media.type || 'video/webm',
      bytes: media.size,
      sha256: mediaHash,
    },
    captureProof: {
      strategy: 'hash-chained-mediarecorder-segments',
      segmentIntervalMs: 1000,
      segmentCount: segments.length,
      finalChainHash: payload.finalChainHash,
      segments,
      note: 'Segments are MediaRecorder output intervals, not individual video frames.',
    },
    context: {
      device,
      location,
      locationConsent,
      biometricCredentialBindingHash,
    },
    anchor: {
      status: 'UNANCHORED',
      payloadSha256,
      compatibleTargets: [
        { provider: 'Numbers Protocol', integration: 'Capture SDK / ERC-7053 asset history', status: 'NOT_CONNECTED' },
        { provider: 'SWEAR', integration: 'Proof-of-Original SDK / permissioned ledger', status: 'NOT_CONNECTED' },
      ],
    },
    claims: [
      'The media SHA-256 digest matches the video file at manifest creation time.',
      'Capture segments form an ordered SHA-256 hash chain.',
      'No blockchain transaction or third-party provenance registration has been performed.',
      'This manifest is not a C2PA Content Credential and is not a SWEAR proof-of-original.',
    ],
  };
};

export const requestCaptureLocation = () => new Promise<CaptureLocation>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Geolocation is not available in this browser.'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => resolve({
      latitude: Number(position.coords.latitude.toFixed(6)),
      longitude: Number(position.coords.longitude.toFixed(6)),
      accuracyMeters: Math.round(position.coords.accuracy),
      capturedAt: new Date(position.timestamp).toISOString(),
    }),
    (error) => reject(new Error(error.message || 'Location permission was denied.')),
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
  );
});
