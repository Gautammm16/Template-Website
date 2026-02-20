import { motion } from 'framer-motion';
import { TEMPLATES } from '../data/templates';
import { useAppStore } from '../store/useAppStore';
import { Music, Film } from 'lucide-react';

const TemplateLibrary = () => {
  const selectedNiche = useAppStore((s) => s.selectedNiche);
  const selectTemplate = useAppStore((s) => s.selectTemplate);
  const setStep = useAppStore((s) => s.setStep);

  const filtered = TEMPLATES.filter((t) => t.niche === selectedNiche);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Pick a <span className="text-gradient">Template</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Each template comes with pre-set transitions, text styles & BGM
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass-card overflow-hidden cursor-pointer group"
            onClick={() => selectTemplate(template)}
          >
            {/* Thumbnail placeholder */}
            <div className="aspect-video bg-secondary relative flex items-center justify-center">
              <Film className="w-10 h-10 text-muted-foreground/40" />
              <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                {template.slots.length} Clips
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Music className="w-3.5 h-3.5" />
                <span>{template.bgm}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {template.slots.map((slot) => (
                  <span
                    key={slot.id}
                    className="text-xs bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground"
                  >
                    {slot.label} ({slot.durationSec}s)
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => setStep(0)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to niches
        </button>
      </motion.div>
    </div>
  );
};

export default TemplateLibrary;
