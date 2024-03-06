import { SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { Details } from '../common/Details/Details';
import { Video } from './Video';
import { VideoControls } from './VideoControls';
import { styles } from './styles';

export const Item = ({ item }: { item: MusicItem }) => {
  const {
    prepareVideoFrame,
    isExpanded,
    expandItem,
    collapseItem,
    removeItemsCache,
  } = useVideoContext();

  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      const observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          const isIntersected = entries.some(
            (entry: IntersectionObserverEntry) => entry.isIntersecting,
          );
          if (isIntersected) {
            prepareVideoFrame();
          }
        },
      );
      const target = itemRef.current;
      observer.observe(target);
      return () => target && observer.unobserve(target);
    }
  }, [prepareVideoFrame]);

  const expandableRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (expandableRef.current) {
      expandableRef.current.open = false;
    }
    removeItemsCache();
  }, [item, removeItemsCache]);

  const onToggle = useCallback(
    (event: SyntheticEvent<HTMLDetailsElement>) => {
      if (event.currentTarget.open) {
        expandItem();
      } else {
        collapseItem();
      }
    },
    [collapseItem, expandItem],
  );

  return (
    <li ref={itemRef} css={styles.item.container}>
      <Details
        ref={expandableRef}
        css={[
          styles.item.expandable.container,
          isExpanded && styles.item.expandable.expanded,
        ]}
        title={`${item.index}위: ${item.artist} - ${item.title}`}
        onToggle={onToggle}
      >
        <Details.Summary css={styles.item.topContainer}>
          <section css={styles.item.leftContainer}>
            <sup>{item.index}</sup>
            <h1 css={styles.item.title}>{item.title}</h1>
          </section>
          <section css={styles.item.rightContainer}>
            <sub css={styles.item.artist}>{item.artist}</sub>
          </section>
        </Details.Summary>
        <Video item={item} />
        <VideoControls />
      </Details>
    </li>
  );
};
