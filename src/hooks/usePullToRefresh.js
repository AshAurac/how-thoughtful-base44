import { useRef, useCallback } from 'react';

/**
 * usePullToRefresh
 * Attach the returned ref to a scrollable container.
 * onRefresh should return a Promise.
 */
export function usePullToRefresh(onRefresh) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const indicator = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && indicator.current) {
      e.preventDefault();
      const progress = Math.min(delta / 80, 1);
      indicator.current.style.opacity = String(progress);
      indicator.current.style.transform = `translateY(${Math.min(delta * 0.4, 32)}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(async (e) => {
    if (!pulling.current) return;
    pulling.current = false;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (indicator.current) {
      indicator.current.style.opacity = '0';
      indicator.current.style.transform = '';
    }
    if (delta > 80) {
      await onRefresh();
    }
  }, [onRefresh]);

  return { onTouchStart, onTouchMove, onTouchEnd, indicatorRef: indicator };
}