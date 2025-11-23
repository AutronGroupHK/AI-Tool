
export type Language = 'en' | 'zh-TW' | 'zh-CN';

export interface Translation {
  title: string;
  subtitle: string;
  uploadTitle: string;
  uploadDesc: string;
  uploadTip: string;
  changePhoto: string;
  genderLabel: string;
  male: string;
  female: string;
  clothingLabel: string;
  clothingPlaceholder: string;
  clothingPresetsLabel: string;
  undo: string;
  redo: string;
  randomBtn: string;
  generateBtn: string;
  regenerateBtn: string;
  downloadBtn: string;
  anglesTitle: string;
  angleLeft45: string;
  angleRight45: string;
  angleFull: string;
  angleClose: string;
  historyTitle: string;
  emptyTitle: string;
  emptyDesc: string;
  errorNoImage: string;
  errorApiKey: string;
  errorEntityNotFound: string;
  errorGeneric: string;
  billingLinkText: string;
  selectKeyBtn: string;
  retryBtn: string;
  loading: string;
  success: string;
  selectPreset: string;
  footerRights: string;
  ctaShareTitle: string;
  ctaShareBtn: string;
}

export type Gender = 'male' | 'female';
export type Resolution = '1K' | '2K' | '4K';

declare global {
  // Define the AIStudio interface
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // Augment Window to include aistudio property
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface GeneratedImage {
  id: string;
  url: string;
  promptUsed: string;
  timestamp: number;
}