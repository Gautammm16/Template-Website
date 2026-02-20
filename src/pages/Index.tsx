import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import StepIndicator from '../components/StepIndicator';
import NicheSelection from '../components/NicheSelection';
import TemplateLibrary from '../components/TemplateLibrary';
import AssetUpload from '../components/AssetUpload';
import ClipTrimmer from '../components/ClipTrimmer';
import ProcessingView from '../components/ProcessingView';
import { Film } from 'lucide-react';

const Index = () => {
  const step = useAppStore((s) => s.step);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <NicheSelection />;
      case 1:
        return <TemplateLibrary />;
      case 2:
        return <AssetUpload />;
      case 3:
        return <ClipTrimmer />;
      case 4:
        return <ProcessingView />;
      default:
        return <NicheSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Flixtar <span className="text-primary">Automate</span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Template-based video editing
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <StepIndicator />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
