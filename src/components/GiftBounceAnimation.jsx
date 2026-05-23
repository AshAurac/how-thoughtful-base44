import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

export default function GiftBounceAnimation({ onComplete }) {
  const [phase, setPhase] = useState('bounce'); // bounce → fly → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fly'), 600);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={
              phase === 'bounce'
                ? { scale: [0.5, 1.3, 1], opacity: 1, y: [0, -20, 0] }
                : { scale: [1, 1.5, 0.3], opacity: [1, 1, 0], y: [0, -40, -300], x: [0, 30, 80] }
            }
            transition={
              phase === 'bounce'
                ? { duration: 0.6, ease: 'easeOut' }
                : { duration: 0.8, ease: 'easeIn' }
            }
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-2xl bg-terracotta flex items-center justify-center shadow-xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            {phase === 'bounce' && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-heading font-bold text-ink text-sm bg-white px-3 py-1 rounded-full shadow"
              >
                Gift sorted! 🎉
              </motion.p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}