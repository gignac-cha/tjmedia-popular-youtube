import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export const PlayerSection = styled.section`
  flex: 2;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) {
    position: sticky;
    top: 81px;
    height: calc(100vh - 81px);
    overflow-y: auto;
    border-top: none;
    box-shadow: none;
  }
`;

export const VideoContainer = styled.div<{ isExpanded: boolean }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  position: relative;
  display: ${({ isExpanded }) => (isExpanded ? 'block' : 'none')};

  &:hover [data-overlay] {
    opacity: 1;
  }

  @media (min-width: 1024px) {
    display: block;
  }
`;

export const PlayerTarget = styled.div`
  width: 100%;
  height: 100%;

  & iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const VideoInfo = styled.div<{ isExpanded: boolean }>`
  padding: 1.5rem 2rem;
  display: ${({ isExpanded }) => (isExpanded ? 'flex' : 'none')};
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

export const MiniPlayerBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  cursor: pointer;
  touch-action: none;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const MiniPlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  overflow: hidden;
`;

const equalizerAnimation = keyframes`
  0%, 100% { height: 3px; }
  50% { height: 14px; }
`;

export const MiniPlayerEqualizer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 16px;
  width: 16px;
  flex-shrink: 0;
`;

export const MiniPlayerEqualizerBar = styled.div<{ delay: number }>`
  width: 3px;
  height: 3px;
  background-color: var(--accent-color);
  border-radius: 1px;
  animation: ${equalizerAnimation} 0.8s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

export const MiniPlayerTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const VideoTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const StyledVideoControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const VideoCounter = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`;

export const OverlayControls = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s;

  @media (min-width: 1024px) {
    opacity: 0;
  }
`;

export const OverlayArrow = styled.button`
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
    transform: none;
  }
`;

export const OverlayCounter = styled.div`
  pointer-events: none;
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  opacity: 1;
  background: rgba(0, 0, 0, 0.6);

  @media (min-width: 1024px) {
    opacity: 0;
  }
  color: #fff;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;
