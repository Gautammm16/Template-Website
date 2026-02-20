import { motion } from 'framer-motion';
import { NICHES } from '../data/templates';
import { useAppStore } from '../store/useAppStore';

const NicheSelection = () => {
  const selectNiche = useAppStore((s) => s.selectNiche);
  const selectedNiche = useAppStore((s) => s.selectedNiche);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Choose Your <span className="text-gradient">Niche</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Select the category that fits your content
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {NICHES.map((niche, i) => (
          <motion.button
            key={niche.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selectNiche(niche.id)}
            className={`glass-card p-6 text-left cursor-pointer transition-all duration-200 group ${
              selectedNiche === niche.id ? 'glow-border' : 'hover:border-primary/40'
            }`}
          >
            <span className="text-3xl mb-3 block">{niche.icon}</span>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {niche.label}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug">
              {niche.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default NicheSelection;
