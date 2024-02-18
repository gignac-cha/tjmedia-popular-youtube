/* eslint-disable @typescript-eslint/no-unused-vars */
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useVideoListQuery } from '../../queries/useYouTubeQuery';
import { commonStyles } from '../../styles/common';
import { Loading } from '../Loading/Loading';
import { styles } from './styles';

export const Item = ({ item }: { item: MusicItem }) => {
  const { index, title, artist } = item;
  const [isListLoading, setListLoading] = useState<boolean>(false);
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isVideoLoading, setVideoLoading] = useState<boolean>(false);

  const { data: items, refetch: getItems } = useVideoListQuery(item);

  useEffect(() => {
    setExpanded(false);
    setSelectedIndex(0);
  }, [item]);

  const video = useMemo(() => {
    if (items.length > 0) {
      const { videoId, title, width, height } = items[selectedIndex];
      const src = `https://www.youtube.com/embed/${videoId}`;
      return { src, title, width, height };
    }
    return {};
  }, [items, selectedIndex]);

  const refs = {
    row4: useRef<HTMLElement>(null),
    video: useRef<HTMLIFrameElement>(null),
  };

  const changeIndex = useCallback(
    (newIndex: number) => {
      if (selectedIndex !== newIndex) {
        setSelectedIndex(newIndex);
        refs.video.current?.setAttribute('width', '50%');
        setVideoLoading(true);
      }
    },
    [refs.video, selectedIndex, setSelectedIndex, setVideoLoading],
  );

  const onClicks = {
    item: async (event: MouseEvent<HTMLButtonElement>) => {
      setExpanded(!isExpanded);
      if (items.length === 0) {
        setListLoading(true);
        await getItems();
        setListLoading(false);
      }
    },
    previous: (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      changeIndex(Math.max(0, selectedIndex - 1));
    },
    next: (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (items && items.length > 0) {
        changeIndex(Math.min(items.length - 1, selectedIndex + 1));
      }
    },
  };

  const onLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    setVideoLoading(false);
    if (refs.row4.current && refs.video.current && items.length > 0) {
      const { clientWidth } = refs.row4.current;
      refs.video.current.setAttribute('width', `${clientWidth}`);
      const { width, height } = items[selectedIndex];
      const clientHeight = clientWidth * (height / width);
      refs.video.current.setAttribute('height', `${clientHeight}`);
    }
  };

  return (
    <li
      css={[styles.item.container, isExpanded && styles.item.expandedContainer]}
    >
      <button
        css={styles.item.expandButton}
        title={`${index}위: ${artist} - ${title}`}
        onClick={onClicks.item}
      >
        <section css={styles.item.leftContainer}>
          <sup>{index}</sup>
          <h1 css={styles.item.title}>{title}</h1>
        </section>
        <section css={styles.item.rightContainer}>
          <sub css={styles.item.artist}>{artist}</sub>
        </section>
      </button>
      {isExpanded && isListLoading && <Loading />}
      <section
        ref={refs.row4}
        css={[
          styles.item.middleContainer,
          isExpanded && styles.item.showMiddleContainer,
        ]}
      >
        <iframe
          ref={refs.video}
          css={[
            styles.item.video,
            isExpanded && styles.item.showVideo,
            isVideoLoading && styles.item.loadingVideo,
          ]}
          {...video}
          onLoad={onLoad}
          title={`${artist} - ${title}`}
        ></iframe>
      </section>
      <section
        css={[
          styles.item.bottomContainer,
          isExpanded && styles.item.showBottomContainer,
        ]}
      >
        <button
          css={commonStyles.button}
          onClick={onClicks.previous}
          disabled={selectedIndex === 0}
          title="이전 영상"
        >
          <FontAwesomeIcon icon={faBackward} /> 이전
        </button>
        {items && items.length && (
          <b title={`총 ${items.length}개의 영상 중 ${selectedIndex + 1}번째`}>
            {selectedIndex + 1} / {items.length}
          </b>
        )}
        <button
          css={commonStyles.button}
          onClick={onClicks.next}
          disabled={items && selectedIndex === items.length - 1}
          title="다음 영상"
        >
          <FontAwesomeIcon icon={faForward} /> 다음
        </button>
      </section>
    </li>
  );
};
