import { useEffect } from 'react';
import { useQueryContext } from '../../contexts/QueryContext';
import { useMusicListQuery } from '../../queries/useTJMediaQuery';
import { EmptyList } from './EmptyList';
import { Items } from './Items';
import { ListLoading } from './ListLoading';
import { styles } from './styles';

export const List = () => {
  const { query, cacheItems, cachedItems } = useQueryContext();
  const { data: items, isFetching, isRefetching } = useMusicListQuery(query);

  useEffect(() => {
    if (items) {
      cacheItems(items);
    }
  }, [cacheItems, items]);

  return (
    <section css={styles.list.container}>
      {(isFetching || isRefetching) && <ListLoading />}
      <ul
        css={[
          styles.list.innerContainer,
          (isFetching || isRefetching) && styles.list.loadingContainer,
        ]}
      >
        {cachedItems && cachedItems.length === 0 && <EmptyList />}
        {cachedItems && cachedItems.length > 0 && <Items items={cachedItems} />}
      </ul>
    </section>
  );
};
