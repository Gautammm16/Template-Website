import { create } from 'zustand';

export interface TemplateSlot {
  id: string;
  label: string;
  durationSec: number;
}

export interface VideoTemplate {
  id: string;
  name: string;
  niche: string;
  thumbnail: string;
  slots: TemplateSlot[];
  bgm: string;
  description: string;
}

export interface UploadedClip {
  id: string;
  file: File;
  url: string;
  durationSec: number;
  slotId: string;
}

export interface TrimData {
  clipId: string;
  startTime: number;
  endTime: number;
}

interface AppState {
  step: number;
  selectedNiche: string | null;
  selectedTemplate: VideoTemplate | null;
  uploadedClips: UploadedClip[];
  trimData: TrimData[];
  isProcessing: boolean;
  finalVideoUrl: string | null;

  setStep: (step: number) => void;
  selectNiche: (niche: string) => void;
  selectTemplate: (template: VideoTemplate) => void;
  addClip: (clip: UploadedClip) => void;
  removeClip: (clipId: string) => void;
  setTrimData: (data: TrimData) => void;
  startProcessing: () => void;
  setFinalVideo: (url: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 0,
  selectedNiche: null,
  selectedTemplate: null,
  uploadedClips: [],
  trimData: [],
  isProcessing: false,
  finalVideoUrl: null,

  setStep: (step) => set({ step }),
  selectNiche: (niche) => set({ selectedNiche: niche, step: 1 }),
  selectTemplate: (template) => set({ selectedTemplate: template, step: 2 }),
  addClip: (clip) => set((s) => ({ uploadedClips: [...s.uploadedClips, clip] })),
  removeClip: (clipId) => set((s) => ({
    uploadedClips: s.uploadedClips.filter((c) => c.id !== clipId),
    trimData: s.trimData.filter((t) => t.clipId !== clipId),
  })),
  setTrimData: (data) => set((s) => ({
    trimData: [...s.trimData.filter((t) => t.clipId !== data.clipId), data],
  })),
  startProcessing: () => set({ isProcessing: true, step: 4 }),
  setFinalVideo: (url) => set({ finalVideoUrl: url, isProcessing: false }),
  reset: () => set({
    step: 0,
    selectedNiche: null,
    selectedTemplate: null,
    uploadedClips: [],
    trimData: [],
    isProcessing: false,
    finalVideoUrl: null,
  }),
}));
