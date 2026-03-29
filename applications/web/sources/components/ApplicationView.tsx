import { type ReactNode, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { SearchForm, TJMediaItem } from '../types/tjmedia.ts';
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

export function ApplicationView({
  searchForm,
  songs,
  isPending,
  isError,
  errorMessage,
  selectedSong,
  onSearchFormChange,
  onSelectSong,
}: {
  searchForm: SearchForm;
  songs: TJMediaItem[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  selectedSong: TJMediaItem | null;
  onSearchFormChange: (next: SearchForm) => void;
  onSelectSong: (song: TJMediaItem) => void;
}): ReactNode {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayerStateChange = useCallback((state: PlayerState) => {
    setIsPlaying(state === 'playing');
  }, []);

  return (
    <PageShell>
      <Header
        searchForm={searchForm}
        onSearchFormChange={onSearchFormChange}
      />

      <MainContent>
        <SongList
          songs={songs}
          isPending={isPending}
          isError={isError}
          errorMessage={errorMessage}
          selectedSong={selectedSong}
          isPlaying={isPlaying}
          onSelectSong={onSelectSong}
        />

        {selectedSong !== null ? (
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
