import { type ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import type { YouTubeItem } from '../../types/youtube.ts';
import type { PlayerState } from '../../hooks/useYouTubePlayer.ts';
import {
  Subtitle,
  EmptyState,
  SkeletonBase,
  IconButton,
} from '../shared/styles.ts';
import {
  PlayerSection,
  VideoContainer,
  PlayerTarget,
  VideoInfo,
  MiniPlayerBar,
  MiniPlayerInfo,
  MiniPlayerTitle,
  MiniPlayerEqualizer,
  MiniPlayerEqualizerBar,
  VideoTitle,
  StyledVideoControls,
  VideoCounter,
  OverlayControls,
  OverlayArrow,
  OverlayCounter,
} from './styles.ts';

export function VideoPlayerView({
  videos,
  isPending,
  isError,
  errorMessage,
  query,
  songTitle,
  artist,
  playerState,
  onContainerReady,
  onVideoChange,
}: {
  videos: YouTubeItem[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  query: string;
  songTitle: string;
  artist: string;
  playerState: PlayerState;
  onContainerReady: (element: HTMLDivElement | null) => void;
  onVideoChange?: (videoId: string) => void;
}): ReactNode {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  const sectionReference = useRef<HTMLElement>(null);
  const dragStartY = useRef<number>(0);
  const currentTranslateY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const COLLAPSE_THRESHOLD_PIXELS = 80;

  const clampedIndex = videos.length > 0 ? Math.min(currentIndex, videos.length - 1) : 0;
  const currentVideo = videos[clampedIndex] ?? null;

  useEffect(() => {
    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
    }
  }, [clampedIndex, currentIndex]);

  useEffect(() => {
    if (currentVideo !== null && onVideoChange !== undefined) {
      onVideoChange(currentVideo.videoId);
    }
  }, [currentVideo?.videoId, onVideoChange]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    dragStartY.current = event.touches[0].clientY;
    currentTranslateY.current = 0;
    isDragging.current = false;

    if (sectionReference.current !== null) {
      sectionReference.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const deltaY = event.touches[0].clientY - dragStartY.current;
    currentTranslateY.current = Math.max(0, deltaY);

    if (currentTranslateY.current > 5) {
      isDragging.current = true;
    }

    if (sectionReference.current !== null) {
      sectionReference.current.style.transform =
        `translateY(${currentTranslateY.current}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (sectionReference.current !== null) {
      sectionReference.current.style.transition = 'transform 0.2s ease-out';
      sectionReference.current.style.transform = 'translateY(0)';
    }

    if (currentTranslateY.current > COLLAPSE_THRESHOLD_PIXELS) {
      setIsMobileExpanded(false);
    }

    isDragging.current = false;
  }, []);

  const handleMiniPlayerBarClick = useCallback(() => {
    if (!isDragging.current) {
      setIsMobileExpanded(!isMobileExpanded);
    }
  }, [isMobileExpanded]);

  if (isPending) {
    return (
      <PlayerSection>
        <EmptyState>
          <SkeletonBase
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              marginBottom: '1rem',
            }}
          />
          <SkeletonBase style={{ width: '200px', height: '24px' }} />
        </EmptyState>
      </PlayerSection>
    );
  }

  if (isError) {
    return (
      <PlayerSection>
        <EmptyState>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{errorMessage ?? 'Failed to load videos.'}</p>
        </EmptyState>
      </PlayerSection>
    );
  }

  if (videos.length === 0 || currentVideo === null) {
    return (
      <PlayerSection>
        <EmptyState>
          <FontAwesomeIcon icon={faPlay} />
          <p>No videos found for &quot;{query}&quot;</p>
        </EmptyState>
      </PlayerSection>
    );
  }

  return (
    <PlayerSection ref={sectionReference}>
      <MiniPlayerBar
        onClick={handleMiniPlayerBarClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <MiniPlayerInfo>
          {playerState === 'playing' ? (
            <MiniPlayerEqualizer>
              <MiniPlayerEqualizerBar delay={0} />
              <MiniPlayerEqualizerBar delay={0.2} />
              <MiniPlayerEqualizerBar delay={0.4} />
            </MiniPlayerEqualizer>
          ) : (
            <FontAwesomeIcon icon={faPlay} color="var(--accent-color)" />
          )}
          <MiniPlayerTitle>
            {songTitle} - {artist}
          </MiniPlayerTitle>
        </MiniPlayerInfo>
        <FontAwesomeIcon
          icon={isMobileExpanded ? faTimes : faChevronRight}
          style={{ transform: isMobileExpanded ? 'none' : 'rotate(-90deg)' }}
        />
      </MiniPlayerBar>

      <VideoContainer isExpanded={isMobileExpanded}>
        <PlayerTarget ref={onContainerReady} />
        {videos.length > 1 && (
          <OverlayControls data-overlay>
            <OverlayArrow
              onClick={() => setCurrentIndex((previous) => Math.max(0, previous - 1))}
              disabled={currentIndex === 0}
              aria-label="Previous video"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </OverlayArrow>
            <OverlayArrow
              onClick={() => setCurrentIndex((previous) => Math.min(videos.length - 1, previous + 1))}
              disabled={currentIndex === videos.length - 1}
              aria-label="Next video"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </OverlayArrow>
          </OverlayControls>
        )}
        {videos.length > 1 && (
          <OverlayCounter data-overlay>
            {currentIndex + 1} / {videos.length}
          </OverlayCounter>
        )}
      </VideoContainer>

      <VideoInfo isExpanded={isMobileExpanded}>
        <div>
          <Subtitle>Now Playing</Subtitle>
          <VideoTitle>
            {songTitle} - {artist}
          </VideoTitle>
        </div>
        <StyledVideoControls>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              setCurrentIndex((previous) => Math.max(0, previous - 1));
            }}
            disabled={currentIndex === 0}
            aria-label="Previous video"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </IconButton>
          <VideoCounter>
            {currentIndex + 1} / {videos.length}
          </VideoCounter>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              setCurrentIndex((previous) =>
                Math.min(videos.length - 1, previous + 1),
              );
            }}
            disabled={currentIndex === videos.length - 1}
            aria-label="Next video"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </IconButton>
        </StyledVideoControls>
      </VideoInfo>
    </PlayerSection>
  );
}
