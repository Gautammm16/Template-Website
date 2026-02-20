import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'];
const MAX_FILE_SIZE_MB = 100;

export const validateVideoFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported format. Use MP4 or MOV.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
  }
  return null;
};

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
  addClips: (clips: UploadedClip[]) => void;
  removeClip: (clipId: string) => void;
  reorderClips: (fromIndex: number, toIndex: number) => void;
  setTrimData: (data: TrimData) => void;
  startProcessing: () => void;
  setFinalVideo: (url: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      addClips: (clips) => set((s) => ({ uploadedClips: [...s.uploadedClips, ...clips] })),
      removeClip: (clipId) =>
        set((s) => ({
          uploadedClips: s.uploadedClips.filter((c) => c.id !== clipId),
          trimData: s.trimData.filter((t) => t.clipId !== clipId),
        })),
      reorderClips: (fromIndex, toIndex) =>
        set((s) => {
          const arr = [...s.uploadedClips];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          // Re-assign slot IDs based on new order
          const template = s.selectedTemplate;
          const updated = arr.map((clip, i) => ({
            ...clip,
            slotId: template?.slots[i]?.id ?? clip.slotId,
          }));
          return { uploadedClips: updated };
        }),
      setTrimData: (data) =>
        set((s) => ({
          trimData: [...s.trimData.filter((t) => t.clipId !== data.clipId), data],
        })),
      startProcessing: () => set({ isProcessing: true, step: 4 }),
      setFinalVideo: (url) => set({ finalVideoUrl: url, isProcessing: false }),
      reset: () =>
        set({
          step: 0,
          selectedNiche: null,
          selectedTemplate: null,
          uploadedClips: [],
          trimData: [],
          isProcessing: false,
          finalVideoUrl: null,
        }),
    }),
    {
      name: 'flixtar-storage',
      partialize: (state) => ({
        step: state.step,
        selectedNiche: state.selectedNiche,
        selectedTemplate: state.selectedTemplate,
        // We can't persist File objects or blob URLs, but we persist the rest
        trimData: state.trimData,
      }),
    }
  )
);
