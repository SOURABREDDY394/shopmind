import { useLayoutEffect, useRef, useCallback } from 'react';
import './ScrollStack.css';

/**
 * ScrollStack — lightweight stack animation component.
 * Uses native scroll events for better performance and avoids nested Lenis instances.
 */
export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 80,
  itemScale = 0.02,
  itemStackDistance = 20,
  stackPosition = '18%',
  scaleEndPosition = '8%',
  baseScale = 0.92,
  rotationAmount = 0.15,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const cardsRef = useRef([]);
  const lastScrollTop = useRef(0);
  const ticking = useRef(false);

  const calculateProgress = (scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  };

  const updateTransforms = useCallback(() => {
    const scroller = useWindowScroll ? document.documentElement : scrollerRef.current;
    if (!scroller || !cardsRef.current.length) return;

    const scrollTop = useWindowScroll ? window.scrollY : scroller.scrollTop;
    const containerHeight = useWindowScroll ? window.innerHeight : scroller.clientHeight;
    
    // Convert percentage to pixels
    const stackPosPx = (parseFloat(stackPosition) / 100) * containerHeight;
    const scaleEndPosPx = (parseFloat(scaleEndPosition) / 100) * containerHeight;

    const endElement = scroller.querySelector('.scroll-stack-end');
    const endElementTop = endElement ? (useWindowScroll ? endElement.getBoundingClientRect().top + window.scrollY : endElement.offsetTop) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = useWindowScroll ? card.getBoundingClientRect().top + window.scrollY : card.offsetTop;
      
      const triggerStart = cardTop - stackPosPx - (itemStackDistance * i);
      const triggerEnd = cardTop - scaleEndPosPx;
      const pinStart = cardTop - stackPosPx - (itemStackDistance * i);
      const pinEnd = endElementTop - (containerHeight / 2);

      // Scale/Rotation Progress
      const progress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + (i * itemScale);
      const scale = 1 - (progress * (1 - targetScale));
      const rotation = rotationAmount ? (i * rotationAmount * progress) : 0;

      // Pinned Y position
      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - pinStart;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - pinStart;
      }

      // Apply transforms (hardware accelerated)
      // We use translate3d and round values to prevent sub-pixel jitters
      card.style.transform = `translate3d(0, ${Math.round(translateY)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotation.toFixed(2)}deg)`;
      
      if (i === cardsRef.current.length - 1 && onStackComplete) {
        if (scrollTop >= pinStart && !card.dataset.completed) {
          card.dataset.completed = 'true';
          onStackComplete();
        }
      }
    });

    ticking.current = false;
  }, [itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, useWindowScroll, onStackComplete]);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateTransforms);
      ticking.current = true;
    }
  }, [updateTransforms]);

  useLayoutEffect(() => {
    const scroller = useWindowScroll ? window : scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll 
        ? document.querySelectorAll('.scroll-stack-card') 
        : scrollerRef.current.querySelectorAll('.scroll-stack-card')
    );
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'top center';
    });

    const target = useWindowScroll ? window : scrollerRef.current;
    target.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial update
    updateTransforms();

    return () => target.removeEventListener('scroll', onScroll);
  }, [useWindowScroll, onScroll, updateTransforms, itemDistance]);

  return (
    <div 
      className={`scroll-stack-scroller ${className}`.trim()} 
      ref={scrollerRef}
      style={!useWindowScroll ? { overflowY: 'auto', overflowX: 'hidden' } : {}}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
