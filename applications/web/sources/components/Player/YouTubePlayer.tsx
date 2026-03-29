import { useState, useEffect, useCallback } from 'react';
import { useYouTubeSearchQuery } from '../../hooks/useYouTubeSearchQuery.ts';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer.ts';
import type { PlayerState } from '../../hooks/useYouTubePlayer.ts';
import { VideoPlayerView } from './VideoPlayerView.tsx';

export function YouTubePlayer({
  query,
  songTitle,
  artist,
  onPlayerStateChange,
}: {
  query: string;
  songTitle: string;
  artist: string;
  onPlayerStateChange?: (state: PlayerState) => void;
}) {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  const { playerState, loadVideo } = useYouTubePlayer(containerElement);
  const { data, isPending, isError, error } = useYouTubeSearchQuery(query);

  const videos = data?.items ?? [];

  useEffect(() => {
    if (onPlayerStateChange !== undefined) {
      onPlayerStateChange(playerState);
    }
  }, [playerState, onPlayerStateChange]);

  const handleVideoChange = useCallback((videoId: string) => {
    loadVideo(videoId);
  }, [loadVideo]);

  return (
    <VideoPlayerView
      videos={videos}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
      query={query}
      songTitle={songTitle}
      artist={artist}
      playerState={playerState}
      onContainerReady={setContainerElement}
      onVideoChange={handleVideoChange}
    />
  );
}
