import { useQuery } from '@tanstack/react-query';
import { fetchYoutubeVideos } from '../services/youtube.ts';

const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

export function useYoutubeSearchQuery(query: string) {
  return useQuery({
    queryKey: ['youtube', query],
    queryFn: () => fetchYoutubeVideos(query),
    staleTime: FIVE_MINUTES_IN_MILLISECONDS,
  });
}
