import { type ReactNode } from 'react';
import styled from '@emotion/styled';
import type { SearchForm, TJMediaItem } from '../types/tjmedia.ts';
import { Header } from './Header/Header.tsx';
import { SongList } from './SongList/SongList.tsx';

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
  isPlaying,
  onSearchFormChange,
  onSelectSong,
  onRetry,
  playerSlot,
}: {
  searchForm: SearchForm;
  songs: TJMediaItem[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  selectedSong: TJMediaItem | null;
  isPlaying?: boolean;
  onSearchFormChange: (next: SearchForm) => void;
  onSelectSong: (song: TJMediaItem) => void;
  onRetry?: () => void;
  playerSlot?: ReactNode;
}): ReactNode {
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
          isPlaying={isPlaying ?? false}
          onSelectSong={onSelectSong}
          onRetry={onRetry}
        />

        {playerSlot}
      </MainContent>
    </PageShell>
  );
}
