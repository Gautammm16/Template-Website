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
          Select the segment you want to use for each slot
        </p>
      </motion.div>

      {/* Clip tabs */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {clips.map((c, i) => {
          const s = template.slots[i];
          const done =
            c.durationSec <= s.durationSec || trimData.some((t) => t.clipId === c.id);
          return (
            <button
              key={c.id}
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
            </button>
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
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary mb-4">
            <video
              src={clip.url}
              className="w-full h-full object-contain"
              controls
              muted
            />
          </div>

          {needsTrim ? (
            <TrimSlider
              clipId={clip.id}
              clipDuration={clip.durationSec}
              slotDuration={slot.durationSec}
              initial={existingTrim}
              onTrim={(start, end) =>
                setTrimData({ clipId: clip.id, startTime: start, endTime: end })
              }
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              ✓ This clip fits within the {slot.durationSec}s slot — no trimming needed.
            </p>
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

function TrimSlider({
  clipId,
  clipDuration,
  slotDuration,
  initial,
  onTrim,
}: {
  clipId: string;
  clipDuration: number;
  slotDuration: number;
  initial?: { startTime: number; endTime: number };
  onTrim: (start: number, end: number) => void;
}) {
  const [start, setStart] = useState(initial?.startTime ?? 0);
  const trackRef = useRef<HTMLDivElement>(null);

  const end = start + slotDuration;
  const maxStart = clipDuration - slotDuration;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(parseFloat(e.target.value), maxStart);
    setStart(val);
    onTrim(val, val + slotDuration);
  };

  useEffect(() => {
    if (!initial) {
      onTrim(0, slotDuration);
    }
  }, []);

  const pctLeft = (start / clipDuration) * 100;
  const pctWidth = (slotDuration / clipDuration) * 100;

  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Clip: {clipDuration.toFixed(1)}s</span>
        <span>
          Selected: {start.toFixed(1)}s – {end.toFixed(1)}s ({slotDuration}s)
        </span>
      </div>

      <div className="relative h-10 rounded-lg bg-secondary overflow-hidden" ref={trackRef}>
        {/* Selected range visualization */}
        <div
          className="absolute top-0 h-full bg-primary/30 border-x-2 border-primary rounded"
          style={{ left: `${pctLeft}%`, width: `${pctWidth}%` }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={maxStart}
        step={0.1}
        value={start}
        onChange={handleChange}
        className="w-full mt-2 accent-[hsl(var(--primary))]"
      />
    </div>
  );
}

export default ClipTrimmer;
