import { useState, useCallback, useEffect } from 'react';
import type { SearchForm, TjmediaItem } from '../types/tjmedia.ts';
import {
  parseSearchFormFromURL,
  parseRankFromURL,
  pushPermalink,
} from '../tools/permalink.ts';

type UsePermalinkResult = {
  searchForm: SearchForm;
  selectedRank: number | null;
  selectedSong: TjmediaItem | null;
  updateSearchForm: (next: SearchForm) => void;
  selectSong: (song: TjmediaItem | null) => void;
  syncSelectedSongFromData: (songs: TjmediaItem[]) => void;
};

function readInitialState(): { searchForm: SearchForm; rank: number | null } {
  const searchParameters = new URLSearchParams(window.location.search);

  return {
    searchForm: parseSearchFormFromURL(searchParameters),
    rank: parseRankFromURL(searchParameters),
  };
}

export function usePermalink(): UsePermalinkResult {
  const [initial] = useState(readInitialState);
  const [searchForm, setSearchForm] = useState<SearchForm>(initial.searchForm);
  const [selectedRank, setSelectedRank] = useState<number | null>(initial.rank);
  const [selectedSong, setSelectedSong] = useState<TjmediaItem | null>(null);

  const updateSearchForm = useCallback((next: SearchForm) => {
    setSearchForm(next);
    setSelectedSong(null);
    setSelectedRank(null);
    pushPermalink(next, null);
  }, []);

  const selectSong = useCallback(
    (song: TjmediaItem | null) => {
      setSelectedSong(song);
      const rank = song !== null ? Number(song.rank) : null;
      setSelectedRank(rank);
      pushPermalink(searchForm, rank);
    },
    [searchForm],
  );

  const syncSelectedSongFromData = useCallback(
    (songs: TjmediaItem[]) => {
      if (selectedRank === null || selectedSong !== null) {
        return;
      }

      const matched = songs.find((song) => Number(song.rank) === selectedRank);

      if (matched !== undefined) {
        setSelectedSong(matched);
      }
    },
    [selectedRank, selectedSong],
  );

  useEffect(() => {
    function handlePopState() {
      const searchParameters = new URLSearchParams(window.location.search);
      setSearchForm(parseSearchFormFromURL(searchParameters));
      const rank = parseRankFromURL(searchParameters);
      setSelectedRank(rank);

      if (rank === null) {
        setSelectedSong(null);
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    searchForm,
    selectedRank,
    selectedSong,
    updateSearchForm,
    selectSong,
    syncSelectedSongFromData,
  };
}
