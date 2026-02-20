import { useEffect, useRef, useState } from "react";

/**
 * usePullToRefresh
 * Attaches pull-to-refresh gesture to a scrollable container ref.
 * @param {Function} onRefresh - async callback to call on pull
 * @param {Object} options
 * @param {number} options.threshold - px to pull before triggering (default 72)
 */
export default function usePullToRefresh(onRefresh, { threshold = 72 } = {}) {
  const containerRef = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startY = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const delta = e.touches[0].clientY - startY;
      if (delta > 0) {
        e.preventDefault();
        setPulling(true);
        setPullDistance(Math.min(delta * 0.5, threshold * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (!isDragging) return;
      isDragging = false;
      if (pullDistance >= threshold) {
        setRefreshing(true);
        setPullDistance(threshold);
        await onRefresh();
        setRefreshing(false);
      }
      setPulling(false);
      setPullDistance(0);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullDistance, threshold]);

  return { containerRef, pulling, pullDistance, refreshing };
}