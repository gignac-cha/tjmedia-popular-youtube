import { PropsWithChildren, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useVideoContext } from '../../contexts/VideoContext';
import { useVideoListQuery } from '../../queries/useYouTubeQuery';
import { Error } from '../common/Error/Error';
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

export const Video = Object.assign(
  ({ children, item }: PropsWithChildren<{ item: MusicItem }>) => {
    const { isExpanded } = useVideoContext();

    return (
      <section
        css={[styles.video.container, isExpanded && styles.video.showContainer]}
      >
        <ErrorBoundary fallback={<Error />}>
          <Suspense fallback={<Loading />}>
            {isExpanded && <SuspenseContainer item={item} />}
          </Suspense>
        </ErrorBoundary>
        {children}
      </section>
    );
  },
  { Frame: VideoFrame, Controls: VideoControls },
);
