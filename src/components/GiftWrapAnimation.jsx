import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GiftWrapAnimation
 * Phase 1 (0–1.2s): page "folds in" like wrapping paper → reveals a gift box in center
 * Phase 2 (1.2–2.2s): gift bounces/pulses in center
 * Phase 3 (2.2–3s): gift flies to the bottom-right "More" tab
 * Phase 4: onComplete fires, navigates away
 */
export default function GiftWrapAnimation({ recipientName, onComplete }) {
  const [phase, setPhase] = useState('wrap'); // wrap → gift → fly → done
  const moreTabRef = useRef(null);
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Find the "More" button position
    const moreBtn = document.querySelector('[data-nav="more"]');
    if (moreBtn) {
      const rect = moreBtn.getBoundingClientRect();
      setFlyTarget({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    } else {
      // fallback: bottom right
      setFlyTarget({ x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40 });
    }

    // Phase transitions
    const t1 = setTimeout(() => setPhase('gift'), 1300);
    const t2 = setTimeout(() => setPhase('fly'), 2500);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Wrapping paper folds: 4 panels that fold inward from each edge
  const panels = [
    { origin: 'top left', initial: { scaleY: 1, y: 0 }, animate: { scaleY: 0, y: 0 }, style: 'top-0 left-0 right-0 h-1/2', gradient: 'from-terracotta to-terracotta-dark', pattern: '🎄🎁🎀🎊' },
    { origin: 'bottom left', initial: { scaleY: 1, y: 0 }, animate: { scaleY: 0, y: 0 }, style: 'bottom-0 left-0 right-0 h-1/2', gradient: 'from-moss to-moss-dark', pattern: '⭐🎅✨🌟' },
    { origin: 'top left', initial: { scaleX: 1, x: 0 }, animate: { scaleX: 0, x: 0 }, style: 'left-0 top-0 bottom-0 w-1/2', gradient: 'from-butter to-butter-dark', pattern: '🎁🎀🎊🎄' },
    { origin: 'top right', initial: { scaleX: 1, x: 0 }, animate: { scaleX: 0, x: 0 }, style: 'right-0 top-0 bottom-0 w-1/2', gradient: 'from-terracotta/80 to-moss/80', pattern: '🌟✨🎅⭐' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">

      {/* Wrapping paper panels */}
      <AnimatePresence>
        {phase === 'wrap' && panels.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.style} bg-gradient-to-br ${p.gradient} flex items-center justify-center overflow-hidden`}
            style={{ transformOrigin: p.origin }}
            initial={{ opacity: 1 }}
            animate={{ ...p.animate, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Wrapping paper pattern */}
            <div className="text-white/30 text-4xl select-none" style={{ letterSpacing: '1.5rem', lineHeight: '3rem' }}>
              {p.pattern.repeat(20)}
            </div>
            {/* Ribbon lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-1.5 bg-white/20" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Overlay that sits behind gift to darken background once wrapped */}
      {(phase === 'gift' || phase === 'fly') && (
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* The Gift Box */}
      <AnimatePresence>
        {(phase === 'gift' || phase === 'fly') && (
          <motion.div
            key="gift"
            className="relative flex flex-col items-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === 'fly'
                ? { scale: 0.3, opacity: 0, x: flyTarget.x, y: flyTarget.y }
                : { scale: 1, opacity: 1, x: 0, y: 0 }
            }
            transition={
              phase === 'fly'
                ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
                : { type: 'spring', stiffness: 300, damping: 18 }
            }
          >
            {/* Gift box art */}
            <div className="w-40 h-40 relative">
              {/* Box body */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-terracotta rounded-2xl shadow-2xl overflow-hidden">
                {/* Vertical ribbon */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-5 bg-white/30" />
                {/* Logo watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="https://media.base44.com/images/public/6a1188b0e669a81e5b3530ea/5247e49c3_RealLogo.png"
                    alt="How Thoughtful"
                    className="w-10 h-10 opacity-60"
                  />
                </div>
              </div>
              {/* Box lid */}
              <div className="absolute top-0 left-0 right-0 h-14 bg-terracotta-dark rounded-t-2xl shadow-lg overflow-hidden">
                {/* Horizontal ribbon on lid */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-5 bg-white/30" />
              </div>
              {/* Bow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-4xl select-none">🎀</div>
            </div>

            {/* Label */}
            {phase === 'gift' && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-heading font-bold text-white text-xl">Gift given!</p>
                <p className="font-accent text-white/80 text-base mt-1">Saved to your Year in Giving ✨</p>
                {recipientName && (
                  <p className="text-white/60 text-sm mt-1">for {recipientName}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}