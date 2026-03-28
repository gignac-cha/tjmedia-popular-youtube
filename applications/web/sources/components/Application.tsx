import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { usePermalink } from '../hooks/usePermalink.ts';
import { usePopularSongsQuery } from '../hooks/usePopularSongsQuery.ts';
import type { PlayerState } from '../hooks/useYouTubePlayer.ts';
import { Header } from './Header/Header.tsx';
import { SongList } from './SongList/SongList.tsx';
import { YouTubePlayer } from './Player/YouTubePlayer.tsx';
import { PlayerSection } from './Player/styles.ts';

const PageShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

export function Application(): JSX.Element {
  const {
    searchForm,
    selectedSong,
    updateSearchForm,
    selectSong,
    syncSelectedSongFromData,
  } = usePermalink();

  const { data, isPending, isError, error } =
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
    <PageShell>
      <Header
        searchForm={searchForm}
        onSearchFormChange={updateSearchForm}
      />

      <MainContent>
        <SongList
          songs={songs}
          isPending={isPending}
          isError={isError}
          errorMessage={error?.message}
          selectedSong={selectedSong}
          isPlaying={isPlaying}
          onSelectSong={selectSong}
        />

        {selectedSong ? (
          <YouTubePlayer
            query={`${selectedSong.indexTitle} ${selectedSong.indexSong}`}
            songTitle={selectedSong.indexTitle}
            artist={selectedSong.indexSong}
            onPlayerStateChange={handlePlayerStateChange}
          />
        ) : (
          <PlayerSection style={{ display: 'none' }} />
        )}
      </MainContent>
    </PageShell>
  );
}
