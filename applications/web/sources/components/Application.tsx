import { type ReactNode, useEffect } from 'react';
import { usePermalink } from '../hooks/usePermalink.ts';
import { usePopularSongsQuery } from '../hooks/usePopularSongsQuery.ts';
import { ApplicationView } from './ApplicationView.tsx';

export function Application(): ReactNode {
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

  useEffect(() => {
    syncSelectedSongFromData(songs);
  }, [songs, syncSelectedSongFromData]);

  return (
    <ApplicationView
      searchForm={searchForm}
      songs={songs}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
      selectedSong={selectedSong}
      onSearchFormChange={updateSearchForm}
      onSelectSong={selectSong}
    />
  );
}
