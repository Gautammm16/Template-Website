import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, UploadedClip } from '../store/useAppStore';
import { Upload, X, Check, FileVideo } from 'lucide-react';

const AssetUpload = () => {
  const template = useAppStore((s) => s.selectedTemplate);
  const clips = useAppStore((s) => s.uploadedClips);
  const addClip = useAppStore((s) => s.addClip);
  const removeClip = useAppStore((s) => s.removeClip);
  const setStep = useAppStore((s) => s.setStep);
  const inputRef = useRef<HTMLInputElement>(null);

  const slots = template?.slots ?? [];
  const currentSlotIndex = clips.length;
  const allFilled = slots.length > 0 && clips.length >= slots.length;

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || allFilled || !slots[currentSlotIndex]) return;

      const slot = slots[currentSlotIndex];
      const url = URL.createObjectURL(file);

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const clip: UploadedClip = {
          id: `clip-${Date.now()}`,
          file,
          url,
          durationSec: video.duration,
          slotId: slot.id,
        };
        addClip(clip);
        URL.revokeObjectURL(video.src);
      };
      video.src = url;

      if (inputRef.current) inputRef.current.value = '';
    },
    [addClip, allFilled, currentSlotIndex, slots]
  );

  if (!template) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Upload Your <span className="text-gradient">Clips</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Add {slots.length} clips for "{template.name}"
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {slots.map((slot, i) => {
          const clip = clips.find((c) => c.slotId === slot.id);
          const isNext = i === currentSlotIndex;

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card p-4 relative ${isNext ? 'glow-border' : ''}`}
            >
              <div className="aspect-video rounded-md bg-secondary mb-3 flex items-center justify-center overflow-hidden">
                {clip ? (
                  <video src={clip.url} className="w-full h-full object-cover" muted />
                ) : (
                  <FileVideo className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>

              <p className="text-sm font-medium text-foreground">{slot.label}</p>
              <p className="text-xs text-muted-foreground">{slot.durationSec}s slot</p>

              {clip && (
                <button
                  onClick={() => removeClip(clip.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {clip && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!allFilled && slots[currentSlotIndex] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFile}
            className="hidden"
            id="clip-upload"
          />
          <label
            htmlFor="clip-upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Upload Clip {currentSlotIndex + 1} — {slots[currentSlotIndex].label}
          </label>
        </motion.div>
      )}

      {allFilled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <button
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Continue to Trimming →
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <button
          onClick={() => setStep(1)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to templates
        </button>
      </motion.div>
    </div>
  );
};

export default AssetUpload;
