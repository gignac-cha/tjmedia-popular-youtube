import { SyntheticEvent, useCallback, useMemo } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { styles } from './styles';

export const VideoFrame = ({
  musicItem,
  videoItem,
}: {
  musicItem: MusicItem;
  videoItem?: VideoItem;
}) => {
  const { isVideoLoading, videoLoaded } = useVideoContext();

  const video = useMemo(() => {
    if (!videoItem) {
      return;
    }
    const { videoId, title, width, height } = videoItem;
    const src = `https://www.youtube.com/embed/${videoId}`;
    return { src, title, width, height };
  }, [videoItem]);

  const onLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      if (!videoItem) {
        return;
      } else if (!event.currentTarget.parentElement) {
        return;
      }

      const { clientWidth } = event.currentTarget.parentElement;
      event.currentTarget.setAttribute('width', `${clientWidth}`);
      const { width, height } = videoItem;
      const clientHeight = clientWidth * (height / width);
      event.currentTarget.setAttribute('height', `${clientHeight}`);

      videoLoaded();
    },
    [videoItem, videoLoaded],
  );

  return (
    <section css={styles.video.frame.container}>
      <iframe
        css={[
          styles.video.frame.iframe,
          isVideoLoading && styles.video.frame.loadingIframe,
        ]}
        title={`${musicItem.artist} - ${musicItem.title}`}
        {...video}
        onLoad={onLoad}
      ></iframe>
    </section>
  );
};
