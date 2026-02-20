import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useAppStore, UploadedClip, validateVideoFile } from '../store/useAppStore';
import { Upload, X, Check, FileVideo, GripVertical, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AssetUpload = () => {
  const template = useAppStore((s) => s.selectedTemplate);
  const clips = useAppStore((s) => s.uploadedClips);
  const addClips = useAppStore((s) => s.addClips);
  const removeClip = useAppStore((s) => s.removeClip);
  const setStep = useAppStore((s) => s.setStep);
  const reorderClips = useAppStore((s) => s.reorderClips);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slots = template?.slots ?? [];
  const remaining = Math.max(0, slots.length - clips.length);
  const allFilled = slots.length > 0 && clips.length >= slots.length;

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      const availableSlots = slots.length - clips.length;

      if (files.length > availableSlots) {
        toast({
          title: 'Too many files',
          description: `You selected ${files.length} files but only ${availableSlots} slot${availableSlots !== 1 ? 's' : ''} remaining.`,
          variant: 'destructive',
        });
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      // Validate all files first
      const errors: string[] = [];
      for (const file of files) {
        const err = validateVideoFile(file);
        if (err) errors.push(err);
      }

      if (errors.length > 0) {
        toast({
          title: 'Invalid files',
          description: errors.join(' '),
          variant: 'destructive',
        });
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      setIsLoading(true);

      // Process all files, getting metadata
      const newClips: UploadedClip[] = await Promise.all(
        files.map(
          (file, i) =>
            new Promise<UploadedClip>((resolve) => {
              const slotIndex = clips.length + i;
              const slot = slots[slotIndex];
              const url = URL.createObjectURL(file);
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.onloadedmetadata = () => {
                resolve({
                  id: `clip-${Date.now()}-${i}`,
                  file,
                  url,
                  durationSec: video.duration,
                  slotId: slot.id,
                });
              };
              video.onerror = () => {
                resolve({
                  id: `clip-${Date.now()}-${i}`,
                  file,
                  url,
                  durationSec: 0,
                  slotId: slot.id,
                });
              };
              video.src = url;
            })
        )
      );

      addClips(newClips);
      setIsLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    },
    [addClips, clips.length, slots]
  );

  const handleReorder = (newOrder: UploadedClip[]) => {
    // Find what moved by comparing to current clips
    const oldIds = clips.map((c) => c.id);
    const newIds = newOrder.map((c) => c.id);
    // Find the moved item
    for (let i = 0; i < newIds.length; i++) {
      if (oldIds[i] !== newIds[i]) {
        const fromIndex = oldIds.indexOf(newIds[i]);
        reorderClips(fromIndex, i);
        break;
      }
    }
  };

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
          Select {slots.length} clips for "{template.name}"
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-sm font-medium">
          <span className={clips.length >= slots.length ? 'text-primary' : 'text-foreground'}>
            {clips.length}/{slots.length}
          </span>
          <span className="text-muted-foreground">Clips Selected</span>
          {allFilled && <Check className="w-4 h-4 text-primary" />}
        </div>
      </motion.div>

      {/* Slot tray with drag-and-drop */}
      <Reorder.Group
        axis="x"
        values={clips}
        onReorder={handleReorder}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        as="div"
      >
        {slots.map((slot, i) => {
          const clip = clips[i];
          const isNext = !clip && i === clips.length;

          if (clip) {
            return (
              <Reorder.Item
                key={clip.id}
                value={clip}
                as="div"
                className="relative"
                whileDrag={{ scale: 1.05, zIndex: 50 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="glass-card p-4 cursor-grab active:cursor-grabbing"
                >
                  <div className="aspect-video rounded-md bg-secondary mb-3 flex items-center justify-center overflow-hidden relative">
                    <video src={clip.url} className="w-full h-full object-cover" muted />
                    <div className="absolute top-1 left-1 p-1 rounded bg-background/60">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <p className="text-sm font-medium text-foreground">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{clip.durationSec.toFixed(1)}s / {slot.durationSec}s slot</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClip(clip.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          }

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card p-4 ${isNext ? 'glow-border' : ''}`}
            >
              <div className="aspect-video rounded-md bg-secondary mb-3 flex items-center justify-center">
                <FileVideo className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-foreground">{slot.label}</p>
              <p className="text-xs text-muted-foreground">{slot.durationSec}s slot</p>
            </motion.div>
          );
        })}
      </Reorder.Group>

      {/* Batch upload zone */}
      {!allFilled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="clip-upload"
          />
          <label
            htmlFor="clip-upload"
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-foreground font-medium cursor-pointer hover:border-primary hover:bg-primary/10 transition-all ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-primary" />
            )}
            {isLoading
              ? 'Processing…'
              : `Upload ${remaining} Clip${remaining !== 1 ? 's' : ''}`}
          </label>
          <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            MP4 or MOV, max 100MB each. Select multiple files at once.
          </p>
        </motion.div>
      )}

      {allFilled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Continue to Trimming →
          </motion.button>
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
