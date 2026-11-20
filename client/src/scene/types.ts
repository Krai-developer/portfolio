export type AtmosphereId = 'obsidian' | 'mist' | 'solar';

export type FinishId = 'gold' | 'titanium' | 'ceramic' | 'sapphire';

export type CameraPresetId = 'overview' | 'sculpture' | 'horizon' | 'zenith';

export interface SceneConfig {
  atmosphere: AtmosphereId;
  finish: FinishId;
  cameraPreset: CameraPresetId;
  explode: number; // 0 to 1
  waveEnergy: number; // 0 to 1.5
  parallaxEnabled: boolean;
  autoOrbit: boolean;
  soundEnabled: boolean;
}

export interface InteractiveBeaconInfo {
  id: string;
  label: string;
  role: string;
  frequencyHz: number;
}

export interface AtmosphereTheme {
  id: AtmosphereId;
  label: string;
  isDarkUi: boolean;
  bgColor: number;
  fogDensity: number;
  keyLightColor: number;
  keyLightIntensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  rimLightColor: number;
  rimLightIntensity: number;
  floorColor: number;
  floorAccentColor: string;
  pillarBaseColor: number;
  pillarHighlightColor: number;
  moteColor: number;
  accentHex: string;
}

export const ATMOSPHERE_THEMES: Record<AtmosphereId, AtmosphereTheme> = {
  obsidian: {
    id: 'obsidian',
    label: 'Sapphire Cyan',
    isDarkUi: true,
    bgColor: 0x030d20,
    fogDensity: 0.024,
    keyLightColor: 0x7dd3fc,
    keyLightIntensity: 2.5,
    hemiSkyColor: 0x1e60a8,
    hemiGroundColor: 0x040d1d,
    hemiIntensity: 0.95,
    rimLightColor: 0x38bdf8,
    rimLightIntensity: 1.9,
    floorColor: 0x06152e,
    floorAccentColor: '#1d4ed8',
    pillarBaseColor: 0x0c1e3a,
    pillarHighlightColor: 0x38bdf8,
    moteColor: 0x7dd3fc,
    accentHex: '#38bdf8',
  },
  mist: {
    id: 'mist',
    label: 'Nordic Mist',
    isDarkUi: false,
    bgColor: 0xdce3ec,
    fogDensity: 0.02,
    keyLightColor: 0xfff1dc,
    keyLightIntensity: 2.4,
    hemiSkyColor: 0xeef4fb,
    hemiGroundColor: 0x7c8a9b,
    hemiIntensity: 1.15,
    rimLightColor: 0x9ec5f0,
    rimLightIntensity: 1.2,
    floorColor: 0xcad3df,
    floorAccentColor: '#98a6b8',
    pillarBaseColor: 0xb7c2d0,
    pillarHighlightColor: 0x2563eb,
    moteColor: 0x3b82f6,
    accentHex: '#2563eb',
  },
  solar: {
    id: 'solar',
    label: 'Solar Slate',
    isDarkUi: true,
    bgColor: 0x141118,
    fogDensity: 0.021,
    keyLightColor: 0xffb380,
    keyLightIntensity: 2.7,
    hemiSkyColor: 0x7e648f,
    hemiGroundColor: 0x1a151e,
    hemiIntensity: 0.9,
    rimLightColor: 0xf97316,
    rimLightIntensity: 1.7,
    floorColor: 0x1a1620,
    floorAccentColor: '#3a3047',
    pillarBaseColor: 0x241e2c,
    pillarHighlightColor: 0xfb923c,
    moteColor: 0xfdba74,
    accentHex: '#f97316',
  },
};

export interface FinishSpec {
  id: FinishId;
  label: string;
  swatchHex: string;
  primaryColor: number;
  primaryMetalness: number;
  primaryRoughness: number;
  primaryAnisotropy: number;
  secondaryColor: number;
  secondaryMetalness: number;
  secondaryRoughness: number;
  coreColor: number;
  coreAttenuation: number;
}

export const FINISH_SPECS: Record<FinishId, FinishSpec> = {
  gold: {
    id: 'gold',
    label: 'Brushed Gold',
    swatchHex: '#d4a34b',
    primaryColor: 0xd8a84e,
    primaryMetalness: 0.94,
    primaryRoughness: 0.2,
    primaryAnisotropy: 0.8,
    secondaryColor: 0x1f2530,
    secondaryMetalness: 0.25,
    secondaryRoughness: 0.58,
    coreColor: 0xffedd5,
    coreAttenuation: 0xf59e0b,
  },
  titanium: {
    id: 'titanium',
    label: 'Titanium',
    swatchHex: '#9aa5b4',
    primaryColor: 0xb6c0cc,
    primaryMetalness: 0.96,
    primaryRoughness: 0.16,
    primaryAnisotropy: 0.85,
    secondaryColor: 0x2b3340,
    secondaryMetalness: 0.4,
    secondaryRoughness: 0.52,
    coreColor: 0xe0f2fe,
    coreAttenuation: 0x38bdf8,
  },
  ceramic: {
    id: 'ceramic',
    label: 'Obsidian Matte',
    swatchHex: '#2c3340',
    primaryColor: 0x262b36,
    primaryMetalness: 0.15,
    primaryRoughness: 0.42,
    primaryAnisotropy: 0.1,
    secondaryColor: 0xc99c52,
    secondaryMetalness: 0.92,
    secondaryRoughness: 0.2,
    coreColor: 0xfef3c7,
    coreAttenuation: 0xd97706,
  },
  sapphire: {
    id: 'sapphire',
    label: 'Cobalt Alloy',
    swatchHex: '#3b6fd8',
    primaryColor: 0x3f72d4,
    primaryMetalness: 0.88,
    primaryRoughness: 0.18,
    primaryAnisotropy: 0.75,
    secondaryColor: 0xcbd5e1,
    secondaryMetalness: 0.85,
    secondaryRoughness: 0.24,
    coreColor: 0xdbeafe,
    coreAttenuation: 0x2563eb,
  },
};

export const BEACON_METADATA: InteractiveBeaconInfo[] = [
  {
    id: 'beacon-north',
    label: 'Apogee Resonator I',
    role: 'Primary Orbital Node · 261.6 Hz',
    frequencyHz: 261.63,
  },
  {
    id: 'beacon-east',
    label: 'Harmonic Relay II',
    role: 'Quadrant Sensor · 329.6 Hz',
    frequencyHz: 329.63,
  },
  {
    id: 'beacon-south',
    label: 'Meridian Anchor III',
    role: 'Field Stabilizer · 392.0 Hz',
    frequencyHz: 392.0,
  },
  {
    id: 'beacon-west',
    label: 'Zenith Beacon IV',
    role: 'Phase Coupler · 493.9 Hz',
    frequencyHz: 493.88,
  },
];
