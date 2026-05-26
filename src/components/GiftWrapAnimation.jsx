import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GiftWrapAnimation
 *
 * Phase 1 — 'wrap'   (0–2.4s):  4 panels fold in from right, left, top, bottom
 * Phase 2 — 'hold'   (2.4–5s):  gift box + encouraging message held on screen
 * Phase 3 — 'fly'    (5–6.2s):  gift shrinks and moves to bottom nav
 * Phase 4 — 'done':             onComplete fires
 */

const MESSAGES = [
  "That was so thoughtful! 🎁",
  "They're lucky to have you ✨",
  "You made someone's day 💛",
  "Gifting done with heart ❤️",
  "Another memory made 🌟",
];

// 4 folds: right→in, left→in, top→down, bottom→up
const PANELS = [
  {
    // Right panel folds left
    style: 'right-0 top-0 bottom-0 w-1/2',
    transformOrigin: 'right center',
    initial: { scaleX: 1 },
    animate: { scaleX: 0 },
    delay: 0,
  },
  {
    // Left panel folds right
    style: 'left-0 top-0 bottom-0 w-1/2',
    transformOrigin: 'left center',
    initial: { scaleX: 1 },
    animate: { scaleX: 0 },
    delay: 0.2,
  },
  {
    // Top panel folds down
    style: 'top-0 left-0 right-0 h-1/2',
    transformOrigin: 'top center',
    initial: { scaleY: 1 },
    animate: { scaleY: 0 },
    delay: 0.45,
  },
  {
    // Bottom panel folds up
    style: 'bottom-0 left-0 right-0 h-1/2',
    transformOrigin: 'bottom center',
    initial: { scaleY: 1 },
    animate: { scaleY: 0 },
    delay: 0.65,
  },
];

// Terracotta shades for each panel
const PANEL_COLORS = [
  'bg-terracotta',
  'bg-[#c96b52]',
  'bg-[#d47a62]',
  'bg-[#b85e47]',
];

export default function GiftWrapAnimation({ recipientName, onComplete }) {
  const [phase, setPhase] = useState('wrap');
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  useEffect(() => {
    const moreBtn = document.querySelector('[data-nav="more"]');
    if (moreBtn) {
      const rect = moreBtn.getBoundingClientRect();
      setFlyTarget({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    } else {
      setFlyTarget({ x: 0, y: window.innerHeight / 2 - 40 });
    }

    const t1 = setTimeout(() => setPhase('hold'), 2400);
    const t2 = setTimeout(() => setPhase('fly'),  5000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete?.(); }, 6300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">

      {/* Wrapping paper panels */}
      {PANELS.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.style} ${PANEL_COLORS[i]} pointer-events-none`}
          style={{ transformOrigin: p.transformOrigin }}
          initial={p.initial}
          animate={phase === 'wrap' ? p.animate : p.animate}
          transition={{ duration: 0.55, delay: p.delay, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Subtle diagonal stripe pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 2px, transparent 2px, transparent 12px)',
            }}
          />
          {/* Ribbon line */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {(i === 0 || i === 1) && <div className="w-full h-4 bg-white/20" />}
            {(i === 2 || i === 3) && <div className="h-full w-4 bg-white/20" />}
          </div>
        </motion.div>
      ))}

      {/* Dark overlay once panels have folded */}
      <AnimatePresence>
        {(phase === 'hold' || phase === 'fly') && (
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Gift box + message */}
      <AnimatePresence>
        {(phase === 'hold' || phase === 'fly') && (
          <motion.div
            key="gift"
            className="relative flex flex-col items-center z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === 'fly'
                ? { scale: 0.15, opacity: 0, x: flyTarget.x, y: flyTarget.y }
                : { scale: 1, opacity: 1, x: 0, y: 0 }
            }
            transition={
              phase === 'fly'
                ? { duration: 1.1, ease: [0.4, 0, 1, 1] }
                : { type: 'spring', stiffness: 260, damping: 20 }
            }
          >
            {/* Gift box */}
            <div className="w-44 h-44 relative">
              {/* Box body */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-terracotta rounded-2xl shadow-2xl overflow-hidden">
                {/* Vertical ribbon */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-5 bg-white/25" />
                {/* Logo watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="https://media.base44.com/images/public/6a1188b0e669a81e5b3530ea/5247e49c3_RealLogo.png"
                    alt="How Thoughtful"
                    className="w-10 h-10 opacity-50"
                  />
                </div>
              </div>
              {/* Box lid */}
              <div className="absolute top-0 left-0 right-0 h-14 bg-[#b85e47] rounded-t-2xl shadow-lg overflow-hidden">
                {/* Horizontal ribbon on lid */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-5 bg-white/25" />
              </div>
              {/* Ribbon cross centre dot */}
              <div className="absolute top-[52px] left-1/2 -translate-x-1/2 w-6 h-6 bg-white/40 rounded-full z-10" />
            </div>

            {/* Message */}
            {phase === 'hold' && (
              <motion.div
                className="mt-7 text-center px-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="font-heading font-bold text-white text-2xl leading-snug">
                  {message}
                </p>
                {recipientName && (
                  <p className="font-accent text-white/70 text-lg mt-2">for {recipientName}</p>
                )}
                <p className="text-white/50 text-sm mt-3 font-body">Saved to your Year in Giving</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}