import { useQuery } from '@tanstack/react-query';
import type { SearchForm } from '../types/tjmedia.ts';
import { fetchTJMediaPopularSongs } from '../services/tjmedia.ts';

export function usePopularSongsQuery(searchForm: SearchForm) {
  return useQuery({
    queryKey: ['tjmedia', searchForm],
    queryFn: () => fetchTJMediaPopularSongs(searchForm),
  });
}
