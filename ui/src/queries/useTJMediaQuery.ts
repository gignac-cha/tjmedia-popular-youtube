import { useSuspenseQuery } from '@tanstack/react-query';
import { getMusicList } from '../utilities/tjmedia';

export const useMusicList = (query: TJMediaQuery) =>
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
  });
