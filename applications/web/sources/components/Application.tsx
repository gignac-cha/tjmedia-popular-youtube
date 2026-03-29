import { type ReactNode, useEffect, useState, useCallback } from 'react';
import { usePermalink } from '../hooks/usePermalink.ts';
import { usePopularSongsQuery } from '../hooks/usePopularSongsQuery.ts';
import type { PlayerState } from '../hooks/useYouTubePlayer.ts';
import { ApplicationView } from './ApplicationView.tsx';
import { YouTubePlayer } from './Player/YouTubePlayer.tsx';
import { PlayerSection } from './Player/styles.ts';

export function Application(): ReactNode {
  const {
    searchForm,
    selectedSong,
    updateSearchForm,
    selectSong,
    syncSelectedSongFromData,
  } = usePermalink();

  const { data, isPending, isError, error, refetch } =
    usePopularSongsQuery(searchForm);

  const songs = data?.resultData?.items ?? [];

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayerStateChange = useCallback((state: PlayerState) => {
    setIsPlaying(state === 'playing');
  }, []);

  useEffect(() => {
    syncSelectedSongFromData(songs);
  }, [songs, syncSelectedSongFromData]);

  useEffect(() => {
    if (selectedSong === null) {
      setIsPlaying(false);
    }
  }, [selectedSong]);

  return (
    <ApplicationView
      searchForm={searchForm}
      songs={songs}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
      selectedSong={selectedSong}
      isPlaying={isPlaying}
      onSearchFormChange={updateSearchForm}
      onSelectSong={selectSong}
      onRetry={() => refetch()}
      playerSlot={
        selectedSong !== null ? (
          <YouTubePlayer
            query={`${selectedSong.indexTitle} ${selectedSong.indexSong}`}
            songTitle={selectedSong.indexTitle}
            artist={selectedSong.indexSong}
            onPlayerStateChange={handlePlayerStateChange}
          />
        ) : (
          <PlayerSection style={{ display: 'none' }} />
        )
      }
    />
  );
}
