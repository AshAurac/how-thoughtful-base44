import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GiftWrapAnimation
 *
 * Phase 1 — 'wrap'  (0–2.4s):  4 panels slide in from outside edges toward centre
 * Phase 2 — 'hold'  (2.4–5.4s): logo + message revealed on terracotta background
 * Phase 3 — 'fly'   (5.4–6.5s): logo shrinks and flies to bottom nav
 * Phase 4 — 'done':             onComplete fires
 */

const MESSAGES = [
  "That was so thoughtful!",
  "They're lucky to have you",
  "You made someone's day",
  "Gifting done with heart",
  "Another memory made",
];

// Each panel starts at scale 0 (invisible, at its outer edge) and expands inward to scale 1
const PANELS = [
  {
    // Right panel: grows leftward from the right edge
    style: 'right-0 top-0 bottom-0 w-1/2',
    transformOrigin: 'right center',
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    color: '#E07A5F',
    delay: 0,
  },
  {
    // Left panel: grows rightward from the left edge
    style: 'left-0 top-0 bottom-0 w-1/2',
    transformOrigin: 'left center',
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    color: '#C96B52',
    delay: 0.18,
  },
  {
    // Top panel: grows downward from the top edge
    style: 'top-0 left-0 right-0 h-1/2',
    transformOrigin: 'top center',
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    color: '#D47A62',
    delay: 0.38,
  },
  {
    // Bottom panel: grows upward from the bottom edge
    style: 'bottom-0 left-0 right-0 h-1/2',
    transformOrigin: 'bottom center',
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    color: '#B85E47',
    delay: 0.56,
  },
];

export default function GiftWrapAnimation({ recipientName, onComplete }) {
  const [phase, setPhase] = useState('wrap');
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

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
    const t2 = setTimeout(() => setPhase('fly'),  5400);
    const t3 = setTimeout(() => { setPhase('done'); onComplete?.(); }, 6600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">

      {/* Wrapping paper panels — slide in from outside edges */}
      {PANELS.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.style} pointer-events-none`}
          style={{ transformOrigin: p.transformOrigin, backgroundColor: p.color }}
          initial={p.initial}
          animate={p.animate}
          transition={{ duration: 0.6, delay: p.delay, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Subtle diagonal stripe */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 2px, transparent 2px, transparent 14px)',
            }}
          />
          {/* Centre ribbon line */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {(i === 0 || i === 1) && <div className="w-full h-4 bg-white/15" />}
            {(i === 2 || i === 3) && <div className="h-full w-4 bg-white/15" />}
          </div>
        </motion.div>
      ))}

      {/* Hold + fly: full terracotta background with logo & message */}
      <AnimatePresence>
        {(phase === 'hold' || phase === 'fly') && (
          <motion.div
            key="hold-bg"
            className="absolute inset-0 bg-terracotta pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === 'hold' || phase === 'fly') && (
          <motion.div
            key="logo-msg"
            className="relative flex flex-col items-center z-10 px-8"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              phase === 'fly'
                ? { scale: 0.1, opacity: 0, x: flyTarget.x, y: flyTarget.y }
                : { scale: 1, opacity: 1, x: 0, y: 0 }
            }
            transition={
              phase === 'fly'
                ? { duration: 1.0, ease: [0.4, 0, 1, 1] }
                : { type: 'spring', stiffness: 240, damping: 22 }
            }
          >
            {/* Big logo */}
            <motion.img
              src="https://media.base44.com/images/public/6a1188b0e669a81e5b3530ea/5247e49c3_RealLogo.png"
              alt="How Thoughtful"
              className="w-28 h-28 mb-7"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            />

            {/* Message */}
            {phase === 'hold' && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-heading font-bold text-white text-3xl leading-snug">
                  {message}
                </p>
                {recipientName && (
                  <p className="font-accent text-white/75 text-xl mt-3">for {recipientName}</p>
                )}
                <p className="text-white/50 text-sm mt-4 font-body">Saved to your Year in Giving</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}