import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const STEPS = ['Niche', 'Template', 'Upload', 'Trim', 'Export'];

const StepIndicator = () => {
  const step = useAppStore((s) => s.step);

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <motion.div
            initial={false}
            animate={{
              scale: i === step ? 1.1 : 1,
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i < step
                ? 'step-indicator-done'
                : i === step
                ? 'step-indicator-active'
                : 'step-indicator-pending'
            }`}
          >
            {i < step ? '✓' : i + 1}
          </motion.div>
          <span
            className={`text-xs hidden sm:inline ${
              i === step ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`w-6 h-px ${
                i < step ? 'bg-primary/50' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
