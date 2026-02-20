import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Download, Share2, RotateCcw, Loader2 } from 'lucide-react';

const processingSteps = [
  'Analyzing your clips…',
  'Applying transitions & overlays…',
  'Adding text animations…',
  'Mixing audio & BGM…',
  'Rendering final video…',
];

const ProcessingView = () => {
  const isProcessing = useAppStore((s) => s.isProcessing);
  const finalVideoUrl = useAppStore((s) => s.finalVideoUrl);
  const setFinalVideo = useAppStore((s) => s.setFinalVideo);
  const reset = useAppStore((s) => s.reset);
  const template = useAppStore((s) => s.selectedTemplate);
  const [stepIdx, setStepIdx] = useState(0);

  // Simulate processing
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setFinalVideo('demo-complete');
          }, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing, setFinalVideo]);

  if (isProcessing && !finalVideoUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12"
        >
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Editing Your Video</h2>
          <p className="text-muted-foreground mb-8">
            Using template: <span className="text-foreground">{template?.name}</span>
          </p>

          <div className="space-y-3">
            {processingSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: i <= stepIdx ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    i < stepIdx
                      ? 'bg-primary'
                      : i === stepIdx
                      ? 'bg-primary animate-pulse-glow'
                      : 'bg-muted-foreground/30'
                  }`}
                />
                <span
                  className={
                    i <= stepIdx ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {step}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: `${((stepIdx + 1) / processingSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Your Video is <span className="text-gradient">Ready!</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Preview and download your professionally edited video
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        {/* Demo preview placeholder */}
        <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center mb-6">
          <div className="text-center">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-foreground font-medium">{template?.name}</p>
            <p className="text-sm text-muted-foreground">Final render preview</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download MP4
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Create another video
        </button>
      </motion.div>
    </div>
  );
};

export default ProcessingView;
