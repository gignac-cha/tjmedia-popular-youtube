import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { SkeletonBase } from '../shared/styles.ts';

export const ListSection = styled.section`
  flex: 1;
  border-right: 1px solid var(--border-color);
  padding-bottom: 80px;

  @media (min-width: 1024px) {
    max-width: 500px;
    padding-bottom: 0;
  }
`;

export const ListHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ListCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const selectPulse = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(0.97); }
  70% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const goldShimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const StyledSongItem = styled.div<{ isSelected: boolean; index: number }>`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1.5rem;
  background-color: ${({ isSelected }) =>
    isSelected ? 'var(--bg-tertiary)' : 'transparent'};
  border-bottom: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: 2.5rem 48px 1fr;
  gap: 1rem;
  align-items: center;
  transition: background-color 0.2s;
  cursor: pointer;
  animation: ${slideIn} 0.4s ease-out both;
  animation-delay: ${({ index }) => Math.min(index * 30, 600)}ms;

  &:hover {
    background-color: ${({ isSelected }) =>
      isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'};
  }

  &[data-selected='true'] {
    animation: ${selectPulse} 0.3s ease-out;
  }
`;

export const GoldRank = styled.div`
  font-size: 1.125rem;
  font-weight: 800;
  text-align: center;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(
    90deg,
    #ffd700 0%,
    #fff8dc 25%,
    #ffd700 50%,
    #fff8dc 75%,
    #ffd700 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${goldShimmer} 3s linear infinite;
`;

export const Rank = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

export const ThumbnailContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-tertiary);
  flex-shrink: 0;

  .song-item:hover & > div {
    opacity: 1;
  }
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
`;

export const SelectedRank = styled.div`
  color: var(--accent-color);
  font-size: 0.75rem;
`;

const equalizerAnimation = keyframes`
  0%, 100% { height: 3px; }
  50% { height: 14px; }
`;

export const Equalizer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 16px;
`;

export const EqualizerBar = styled.div<{ delay: number }>`
  width: 3px;
  height: 3px;
  background-color: var(--accent-color);
  border-radius: 1px;
  animation: ${equalizerAnimation} 0.8s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

export const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
`;

export const SongTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SongArtist = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


export const SkeletonItem = styled.div`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: 2.5rem 48px 1fr;
  gap: 1rem;
  align-items: center;
`;

export const SkeletonRank = styled(SkeletonBase)`
  width: 24px;
  height: 24px;
  margin: 0 auto;
`;

export const SkeletonThumb = styled(SkeletonBase)`
  width: 48px;
  height: 48px;
  border-radius: 8px;
`;

export const SkeletonTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SkeletonTitle = styled(SkeletonBase)`
  width: 60%;
  height: 16px;
`;

export const SkeletonArtist = styled(SkeletonBase)`
  width: 40%;
  height: 14px;
`;

export const SkeletonPro = styled(SkeletonBase)`
  width: 60px;
  height: 24px;
  border-radius: 6px;
`;
