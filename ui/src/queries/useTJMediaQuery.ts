import { useQuery } from '@tanstack/react-query';
import { getMusicList } from '../utilities/tjmedia';

export const useMusicListQuery = (query: TJMediaQuery) =>
  useQuery({
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
