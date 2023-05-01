import { FunctionComponent, MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';

import { useMainContext } from '../contexts/main';
import { MusicItem } from '../utilities/tjmedia';
import { getVideoList, VideoItem } from '../utilities/youtube';
import { Loading } from './loading';

export interface ItemProperties {
  item: MusicItem;
}

export const Item: FunctionComponent<ItemProperties> = ({ item }) => {
  const { index, title, artist } = item;
  const { isLoading } = useMainContext();
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
    row4: useRef<HTMLDivElement>(null),
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
    item: async (event: MouseEvent<HTMLDivElement>) => {
      setExpanded(!isExpanded);
      if (!items) {
        setListLoading(true);
        try {
          setItems(await getVideoList(item));
        } catch (error) {}
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
    <div className={classnames(['item', isLoading && 'item-loading', isExpanded && 'expanded'])} onClick={onClicks.item}>
      <div className="row-1">
        <div className="index">{index}</div>
        <div className="title">{title}</div>
      </div>
      <div className="row-2">
        <div className="artist">{artist}</div>
      </div>
      <Loading isLoading={isListLoading} />
      <div className="row-3"></div>
      <div ref={refs.row4} className={classnames(['row-4', !isExpanded && 'hide'])}>
        {video.src && (
          <iframe
            ref={refs.video}
            className={classnames(['video', !isExpanded && 'hide', isVideoLoading && 'video-loading'])}
            {...video}
            onLoad={onLoad}
          ></iframe>
        )}
      </div>
      <div className={classnames(['row-5', !isExpanded && 'hide'])}>
        <button className="previous" onClick={onClicks.previous} disabled={selectedIndex === 0}>
          <FontAwesomeIcon icon={faBackward} /> 이전
        </button>
        {items && items.length && (
          <div className="indicator">
            {selectedIndex + 1} / {items.length}
          </div>
        )}
        <button className="next" onClick={onClicks.next} disabled={items && selectedIndex === items.length - 1}>
          <FontAwesomeIcon icon={faForward} /> 다음
        </button>
      </div>
    </div>
  );
};
