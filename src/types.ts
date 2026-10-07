export type ProcessingMode =
  | 'blend'
  | 'restore'
  | 'bg_remove'
  | 'poster'
  | 'passport'
  | 'studio'
  | 'skin'
  | 'style'
  | 'life_album';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type ImageRole = 'original' | 'composite' | 'reference';

export interface UploadedImage {
  id: string;
  file?: File;
  dataUrl: string;
  role: ImageRole;
  label: string;
  width?: number;
  height?: number;
}

export interface GenerationOptions {
  aspectRatio: AspectRatio;
  count: number; // 1, 2, 4
  highQuality: boolean; // Nano Banana HD
  
  // Mode specific sub-options
  colorize: boolean; // for restore
  scaleUp: boolean; // for restore
  scratchFix: boolean; // for restore
  passportBg: 'white' | 'light_gray' | 'blue';
  passportAttire: 'suit' | 'original';
  studioTheme: 'warm_light' | 'velvet_dark' | 'clean_minimal' | 'dramatic_flash';
  skinLevel: 'natural' | 'medium' | 'flawless';
  textOverlay: string;
  textStyle: 'bold_modern' | 'luxury_serif' | 'cyber_neon' | 'editorial_clean';
  styleType: 'anime' | 'cyberpunk' | 'watercolor' | 'oil_painting' | 'sketch_color' | 'vintage_film';
  age: number; // 7, 18, 25, 45, 70
  bgType: 'transparent' | 'clean_white' | 'pastel_studio';
  bgThreshold: number; // 20 ~ 80
}

export interface GeneratedResult {
  id: string;
  imageUrl: string;
  originalUrl?: string; // For before/after slider comparison!
  prompt: string;
  mode: ProcessingMode;
  modeLabel: string;
  timestamp: string;
  options: GenerationOptions;
}

export interface SamplePreset {
  id: string;
  title: string;
  description: string;
  mode: ProcessingMode;
  idea: string;
  sampleOriginalUrl: string;
  sampleCompositeUrl?: string;
  optionsPartial?: Partial<GenerationOptions>;
}
