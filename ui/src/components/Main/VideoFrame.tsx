import { SyntheticEvent, useCallback, useMemo } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { styles } from './styles';

export const VideoFrame = ({ item }: { item: MusicItem }) => {
  const { cachedItems, selectedIndex, isVideoLoading, videoLoaded } =
    useVideoContext();

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
    <iframe
      css={[styles.item.video, isVideoLoading && styles.item.loadingVideo]}
      title={`${item.artist} - ${item.title}`}
      {...video}
      onLoad={onLoad}
    ></iframe>
  );
};
