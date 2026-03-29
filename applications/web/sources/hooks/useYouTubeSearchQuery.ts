import { useQuery } from '@tanstack/react-query';
import { fetchYouTubeVideos } from '../services/youtube.ts';

const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

export function useYouTubeSearchQuery(query: string) {
  return useQuery({
    queryKey: ['youtube', query],
    queryFn: () => fetchYouTubeVideos(query),
    staleTime: FIVE_MINUTES_IN_MILLISECONDS,
  });
}
