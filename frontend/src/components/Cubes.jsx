import React, { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Cubes — lightweight canvas isometric cube grid for the ShopMind hero.
 * Only paints when the canvas is visible in the viewport.
 * Skips rendering on mobile (< 768px).
 */
const Cubes = ({
  faceColor = 'rgba(240,253,250,0.55)',
  borderColor = 'rgba(16,185,129,0.35)',
  cubeSize = 48,
  gap = 10,
  opacity = 0.45,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  const [isVisible, setVisible] = useState(false);

  // Only paint when canvas is in the viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip on mobile
    if (window.innerWidth < 768) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const step = cubeSize + gap;
    const cols = Math.ceil(W / step);
    const rows = Math.ceil(H / step);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * step;
        const cy = r * step + Math.sin(t.current * 0.2 + c * 0.3 + r * 0.2) * 2;

        const s = cubeSize;
        const half = s / 2;
        const topH = half * 0.35;

        ctx.save();
        ctx.globalAlpha = opacity;

        // Front face
        ctx.beginPath();
        ctx.rect(cx - half, cy - half + topH, s, s - topH);
        ctx.fillStyle = faceColor;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Top face
        ctx.beginPath();
        ctx.moveTo(cx - half, cy - half + topH);
        ctx.lineTo(cx, cy - half);
        ctx.lineTo(cx + half + half * 0.3, cy - half + topH * 0.5);
        ctx.lineTo(cx + half, cy - half + topH);
        ctx.closePath();
        ctx.fillStyle = faceColor;
        ctx.globalAlpha = opacity * 0.6;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      }
    }

    t.current += 0.008;
    raf.current = requestAnimationFrame(draw);
  }, [cubeSize, gap, faceColor, borderColor, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    // Skip on mobile
    if (window.innerWidth < 768) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.2); // Further cap DPR for speed
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.getContext('2d').scale(dpr, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, [draw, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
};

export default Cubes;
