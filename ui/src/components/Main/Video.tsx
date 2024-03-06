import { Suspense, useEffect } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { useVideoListQuery } from '../../queries/useYouTubeQuery';
import { Loading } from '../common/Loading/Loading';
import { VideoControls } from './VideoControls';
import { VideoFrame } from './VideoFrame';
import { styles } from './styles';

const SuspenseContainer = ({ item }: { item: MusicItem }) => {
  const { cacheItems } = useVideoContext();

  const { data: items } = useVideoListQuery(item);

  useEffect(() => {
    cacheItems(items);
  }, [cacheItems, items]);

  return <></>;
};

export const Video = ({ item }: { item: MusicItem }) => {
  const { isExpanded, isPrepared } = useVideoContext();

  return (
    <section
      css={[styles.video.container, isExpanded && styles.video.showContainer]}
    >
      <Suspense fallback={<Loading />}>
        {isExpanded && <SuspenseContainer item={item} />}
      </Suspense>
      {isPrepared && <VideoFrame item={item} />}
      <VideoControls />
    </section>
  );
};
