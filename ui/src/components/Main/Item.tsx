import { SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { Video } from './Video';
import { VideoControls } from './VideoControls';
import { styles } from './styles';

export const Item = ({ item }: { item: MusicItem }) => {
  const { isExpanded, expandItem, collapseItem, removeItemsCache } =
    useVideoContext();

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
    <li css={styles.item.container}>
      <details
        ref={expandableRef}
        css={[
          styles.item.expandable.container,
          isExpanded && styles.item.expandable.expanded,
        ]}
        title={`${item.index}위: ${item.artist} - ${item.title}`}
        onToggle={onToggle}
      >
        <summary css={styles.item.topContainer}>
          <section css={styles.item.leftContainer}>
            <sup>{item.index}</sup>
            <h1 css={styles.item.title}>{item.title}</h1>
          </section>
          <section css={styles.item.rightContainer}>
            <sub css={styles.item.artist}>{item.artist}</sub>
          </section>
        </summary>
        <Video item={item} />
        <VideoControls />
      </details>
    </li>
  );
};
