import { SyntheticEvent, useCallback, useEffect, useMemo } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Details } from '../common/Details/Details';
import { Video } from './Video';
import { styles } from './styles';

export const Item = ({ item }: { item: MusicItem }) => {
  const {
    isExpanded,
    expandItem,
    collapseItem,
    removeItemsCache,
    selectedIndex,
    cachedItems,
  } = useVideoContext();

  const {
    isIntersected: isPrepared,
    observe,
    unobserve,
  } = useIntersectionObserver();

  useEffect(() => {
    removeItemsCache();
    return () => unobserve();
  }, [removeItemsCache, unobserve]);

  const expandableRefCallback = useCallback(
    (ref: HTMLDetailsElement) => item && ref && (ref.open = false),
    // NOTE: `item` must be included in dependencies
    // because of `open` not reset when changing `query.strType`.
    [item],
  );

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

  const videoItem = useMemo(
    () => (cachedItems.length > 0 ? cachedItems[selectedIndex] : undefined),
    [cachedItems, selectedIndex],
  );

  return (
    <li ref={(ref) => ref && observe(ref)} css={styles.item.container}>
      <Details
        ref={expandableRefCallback}
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
        {isPrepared && (
          <Video item={item}>
            <Video.Frame musicItem={item} videoItem={videoItem} />
            <Video.Controls />
          </Video>
        )}
      </Details>
    </li>
  );
};
