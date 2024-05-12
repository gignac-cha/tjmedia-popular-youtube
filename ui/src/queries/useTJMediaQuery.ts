import { useSuspenseQuery } from '@tanstack/react-query';
import { getMusicList } from '../utilities/tjmedia';

export const useMusicListQuery = (query: TJMediaQuery) =>
  useSuspenseQuery({
    queryKey: [
      'tjmedia-music-list',
      query.strType,
      query.SYY,
      query.SMM,
      query.EYY,
      query.EMM,
    ],
    queryFn: () => getMusicList(query),
    staleTime: 60 * 60 * 1000,
  });
