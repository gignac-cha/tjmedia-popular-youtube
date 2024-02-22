import { useSuspenseQuery } from '@tanstack/react-query';
import { getVideoList } from '../utilities/youtube';

export const useVideoListQuery = (item: MusicItem) =>
  useSuspenseQuery({
    queryKey: ['youtube-video-list', item.artist, item.title],
    queryFn: () => getVideoList(item),
    staleTime: 60 * 60 * 1000,
  });
