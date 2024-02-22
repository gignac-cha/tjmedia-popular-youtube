import {
  Suspense,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { useVideoListQuery } from '../../queries/useYouTubeQuery';
import { Loading } from '../Loading/Loading';
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
  const {
    isExpanded,
    cachedItems,
    selectedIndex,
    isVideoLoading,
    videoLoaded,
  } = useVideoContext();

  const video = useMemo(() => {
    if (cachedItems.length === 0) {
      return;
    }

    const { videoId, title, width, height } = cachedItems[selectedIndex];
    const src = `https://www.youtube.com/embed/${videoId}`;
    return { src, title, width, height };
  }, [cachedItems, selectedIndex]);

  const onLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      if (cachedItems.length === 0) {
        return;
      } else if (!event.currentTarget.parentElement) {
        return;
      }

      const { clientWidth } = event.currentTarget.parentElement;
      event.currentTarget.setAttribute('width', `${clientWidth}`);
      const { width, height } = cachedItems[selectedIndex];
      const clientHeight = clientWidth * (height / width);
      event.currentTarget.setAttribute('height', `${clientHeight}`);

      videoLoaded();
    },
    [cachedItems, selectedIndex, videoLoaded],
  );

  return (
    <section
      css={[
        styles.item.middleContainer,
        isExpanded && styles.item.showMiddleContainer,
      ]}
    >
      <Suspense fallback={<Loading />}>
        {isExpanded && <SuspenseContainer item={item} />}
      </Suspense>
      <iframe
        css={[styles.item.video, isVideoLoading && styles.item.loadingVideo]}
        title={`${item.artist} - ${item.title}`}
        {...video}
        onLoad={onLoad}
      ></iframe>
    </section>
  );
};
