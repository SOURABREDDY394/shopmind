import { useEffect, useRef, useState } from 'react';

/**
 * useInView — fires once when element enters viewport.
 * Returns [ref, isVisible].
 */
export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px' }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
};

/**
 * useCountUp — animates a number from 0 to target when triggered.
 */
export const useCountUp = (target, isVisible, duration = 1000) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isVisible || target <= 0) {
      if (target <= 0) setValue(0);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, isVisible, duration]);

  return value;
};

/**
 * useStaggeredReveal — returns an array of booleans that flip true one-by-one.
 */
export const useStaggeredReveal = (count, isVisible, delay = 100) => {
  const [revealed, setRevealed] = useState(() => new Array(count).fill(false));
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!isVisible) {
      setRevealed(new Array(count).fill(false));
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(new Array(count).fill(true));
      return;
    }

    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * delay);
      timers.current.push(timer);
    }

    return () => timers.current.forEach(clearTimeout);
  }, [count, isVisible, delay]);

  return revealed;
};
