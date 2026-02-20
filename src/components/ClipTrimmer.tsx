import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Scissors } from 'lucide-react';

const ClipTrimmer = () => {
  const template = useAppStore((s) => s.selectedTemplate);
  const clips = useAppStore((s) => s.uploadedClips);
  const trimData = useAppStore((s) => s.trimData);
  const setTrimData = useAppStore((s) => s.setTrimData);
  const startProcessing = useAppStore((s) => s.startProcessing);
  const setStep = useAppStore((s) => s.setStep);

  const [activeIndex, setActiveIndex] = useState(0);

  if (!template) return null;

  const clip = clips[activeIndex];
  const slot = template.slots[activeIndex];
  const needsTrim = clip && clip.durationSec > slot.durationSec;
  const existingTrim = trimData.find((t) => t.clipId === clip?.id);

  const allTrimmed = clips.every((c) => {
    const s = template.slots.find((sl) => sl.id === c.slotId);
    if (!s) return true;
    if (c.durationSec <= s.durationSec) return true;
    return trimData.some((t) => t.clipId === c.id);
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="text-gradient">Trim</span> Your Clips
        </h2>
        <p className="text-muted-foreground text-lg">
          Drag the handles to select In & Out points
        </p>
      </motion.div>

      {/* Clip tabs */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {clips.map((c, i) => {
          const s = template.slots[i];
          const done =
            c.durationSec <= s.durationSec || trimData.some((t) => t.clipId === c.id);
          return (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeIndex === i
                  ? 'bg-primary text-primary-foreground'
                  : done
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {s.label}
              {done && ' ✓'}
            </motion.button>
          );
        })}
      </div>

      {clip && (
        <motion.div
          key={clip.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
        >
          {needsTrim ? (
            <DualHandleTrimmer
              clipId={clip.id}
              clipUrl={clip.url}
              clipDuration={clip.durationSec}
              slotDuration={slot.durationSec}
              initial={existingTrim}
              onTrim={(start, end) =>
                setTrimData({ clipId: clip.id, startTime: start, endTime: end })
              }
            />
          ) : (
            <>
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary mb-4">
                <video
                  src={clip.url}
                  className="w-full h-full object-contain"
                  controls
                  muted
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                ✓ This clip fits within the {slot.durationSec}s slot — no trimming needed.
              </p>
            </>
          )}
        </motion.div>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => setStep(2)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to uploads
        </button>
        {allTrimmed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={startProcessing}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Scissors className="w-4 h-4" />
            Process Video
          </motion.button>
        )}
      </div>
    </div>
  );
};

/**
 * Dual-handle trimmer with real-time video seeking
 */
function DualHandleTrimmer({
  clipId,
  clipUrl,
  clipDuration,
  slotDuration,
  initial,
  onTrim,
}: {
  clipId: string;
  clipUrl: string;
  clipDuration: number;
  slotDuration: number;
  initial?: { startTime: number; endTime: number };
  onTrim: (start: number, end: number) => void;
}) {
  const [inPoint, setInPoint] = useState(initial?.startTime ?? 0);
  const [outPoint, setOutPoint] = useState(initial?.endTime ?? slotDuration);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'in' | 'out' | null>(null);

  const selectedDuration = outPoint - inPoint;

  // Auto-set on mount
  useEffect(() => {
    if (!initial) {
      const end = Math.min(slotDuration, clipDuration);
      setInPoint(0);
      setOutPoint(end);
      onTrim(0, end);
    }
  }, []);

  // Seek video when in-point changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = inPoint;
    }
  }, [inPoint]);

  const handlePointerDown = useCallback(
    (handle: 'in' | 'out') => (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = handle;

      const onMove = (ev: PointerEvent) => {
        if (!trackRef.current || !draggingRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        const time = parseFloat((pct * clipDuration).toFixed(1));

        if (draggingRef.current === 'in') {
          const newIn = Math.min(time, outPoint - 0.5);
          setInPoint(Math.max(0, newIn));
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, newIn);
        } else {
          const newOut = Math.max(time, inPoint + 0.5);
          setOutPoint(Math.min(clipDuration, newOut));
        }
      };

      const onUp = () => {
        if (draggingRef.current === 'in') {
          onTrim(inPoint, outPoint);
        } else {
          onTrim(inPoint, outPoint);
        }
        draggingRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [clipDuration, inPoint, outPoint, onTrim]
  );

  const pctIn = (inPoint / clipDuration) * 100;
  const pctOut = (outPoint / clipDuration) * 100;

  return (
    <div>
      {/* Video preview */}
      <div className="aspect-video rounded-lg overflow-hidden bg-secondary mb-4">
        <video
          ref={videoRef}
          src={clipUrl}
          className="w-full h-full object-contain"
          muted
          playsInline
        />
      </div>

      {/* Info */}
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Clip: {clipDuration.toFixed(1)}s</span>
        <span>
          In: {inPoint.toFixed(1)}s — Out: {outPoint.toFixed(1)}s ({selectedDuration.toFixed(1)}s)
        </span>
        <span>Slot: {slotDuration}s</span>
      </div>

      {/* Dual-handle timeline */}
      <div
        ref={trackRef}
        className="relative h-12 rounded-lg bg-secondary overflow-hidden select-none touch-none"
      >
        {/* Dimmed areas */}
        <div
          className="absolute top-0 h-full bg-background/50"
          style={{ left: 0, width: `${pctIn}%` }}
        />
        <div
          className="absolute top-0 h-full bg-background/50"
          style={{ left: `${pctOut}%`, width: `${100 - pctOut}%` }}
        />

        {/* Selected region */}
        <div
          className="absolute top-0 h-full bg-primary/20 border-x-2 border-primary"
          style={{ left: `${pctIn}%`, width: `${pctOut - pctIn}%` }}
        />

        {/* In handle */}
        <div
          onPointerDown={handlePointerDown('in')}
          className="absolute top-0 h-full w-4 cursor-ew-resize z-10 flex items-center justify-center group"
          style={{ left: `calc(${pctIn}% - 8px)` }}
        >
          <div className="w-1.5 h-8 rounded-full bg-primary group-hover:bg-accent transition-colors shadow-lg" />
        </div>

        {/* Out handle */}
        <div
          onPointerDown={handlePointerDown('out')}
          className="absolute top-0 h-full w-4 cursor-ew-resize z-10 flex items-center justify-center group"
          style={{ left: `calc(${pctOut}% - 8px)` }}
        >
          <div className="w-1.5 h-8 rounded-full bg-primary group-hover:bg-accent transition-colors shadow-lg" />
        </div>
      </div>

      {selectedDuration > slotDuration + 0.1 && (
        <p className="mt-2 text-xs text-destructive flex items-center gap-1">
          ⚠ Selection is {(selectedDuration - slotDuration).toFixed(1)}s over the {slotDuration}s limit. Tighten your range.
        </p>
      )}
    </div>
  );
}

export default ClipTrimmer;
