/* eslint-disable @typescript-eslint/no-unused-vars */
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryContext } from '../../contexts/QueryContext';
import { getVideoList } from '../../utilities/youtube';
import { Loading } from '../Loading/Loading';

export const Item = ({ item }: { item: MusicItem }) => {
  const { index, title, artist } = item;
  const { isLoading } = useQueryContext();
  const [isListLoading, setListLoading] = useState<boolean>(false);
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [items, setItems] = useState<VideoItem[]>();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isVideoLoading, setVideoLoading] = useState<boolean>(false);

  useEffect(() => {
    setExpanded(false);
    setItems(undefined);
    setSelectedIndex(0);
  }, [item]);

  const video = useMemo(() => {
    if (items && items.length > 0) {
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
    [refs.video, selectedIndex, setSelectedIndex, setVideoLoading]
  );

  const onClicks = {
    item: async (event: MouseEvent<HTMLButtonElement>) => {
      setExpanded(!isExpanded);
      if (!items) {
        setListLoading(true);
        try {
          setItems(await getVideoList(item));
        } catch (error) {
          // API error
        }
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
    if (refs.row4.current && refs.video.current && items) {
      const { clientWidth } = refs.row4.current;
      refs.video.current.setAttribute('width', `${clientWidth}`);
      const { width, height } = items[selectedIndex];
      const clientHeight = clientWidth * (height / width);
      refs.video.current.setAttribute('height', `${clientHeight}`);
    }
  };

  return (
    <li
      className={classnames([
        'item',
        isLoading && 'item-loading',
        isExpanded && 'expanded',
      ])}
    >
      <button className="empty-button" onClick={onClicks.item}>
        <section className="row-1">
          <span className="index">{index}</span>
          <h1 className="title">{title}</h1>
        </section>
        <section className="row-2">
          <span className="artist">{artist}</span>
        </section>
      </button>
      <Loading isLoading={isListLoading} />
      <section className="row-3"></section>
      <section
        ref={refs.row4}
        className={classnames(['row-4', !isExpanded && 'hide'])}
      >
        {video.src && (
          <iframe
            ref={refs.video}
            className={classnames([
              'video',
              !isExpanded && 'hide',
              isVideoLoading && 'video-loading',
            ])}
            {...video}
            onLoad={onLoad}
            title={`${artist} - ${title}`}
          ></iframe>
        )}
      </section>
      <section className={classnames(['row-5', !isExpanded && 'hide'])}>
        <button
          className="previous"
          onClick={onClicks.previous}
          disabled={selectedIndex === 0}
        >
          <FontAwesomeIcon icon={faBackward} /> 이전
        </button>
        {items && items.length && (
          <span className="indicator">
            {selectedIndex + 1} / {items.length}
          </span>
        )}
        <button
          className="next"
          onClick={onClicks.next}
          disabled={items && selectedIndex === items.length - 1}
        >
          <FontAwesomeIcon icon={faForward} /> 다음
        </button>
      </section>
    </li>
  );
};
