import { useRef, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  animation: ${fadeIn} 0.2s ease-out;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 51;
  background-color: var(--bg-secondary);
  border-radius: 16px 16px 0 0;
  padding: 0 1.5rem 2rem;
  max-height: 80vh;
  overflow-y: auto;
  animation: ${slideUp} 0.25s ease-out;
  touch-action: none;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const DragHandle = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
  cursor: grab;

  &::after {
    content: '';
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background-color: var(--border-color);
  }
`;

const DISMISS_THRESHOLD_PIXELS = 80;

export function BottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const sheetReference = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const currentTranslateY = useRef<number>(0);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    dragStartY.current = event.touches[0].clientY;
    currentTranslateY.current = 0;

    if (sheetReference.current !== null) {
      sheetReference.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const deltaY = event.touches[0].clientY - dragStartY.current;
    currentTranslateY.current = Math.max(0, deltaY);

    if (sheetReference.current !== null) {
      sheetReference.current.style.transform =
        `translateY(${currentTranslateY.current}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (sheetReference.current !== null) {
      sheetReference.current.style.transition = 'transform 0.2s ease-out';
    }

    if (currentTranslateY.current > DISMISS_THRESHOLD_PIXELS) {
      if (sheetReference.current !== null) {
        sheetReference.current.style.transform = 'translateY(100%)';
      }

      setTimeout(onClose, 200);
    } else {
      if (sheetReference.current !== null) {
        sheetReference.current.style.transform = 'translateY(0)';
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Backdrop onClick={onClose} />
      <Sheet
        ref={sheetReference}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DragHandle />
        {children}
      </Sheet>
    </>
  );
}
