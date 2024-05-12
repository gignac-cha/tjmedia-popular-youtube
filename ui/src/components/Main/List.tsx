import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryContext } from '../../contexts/QueryContext';
import { useMusicListQuery } from '../../queries/useTJMediaQuery';
import { EmptyList } from './EmptyList';
import { Items } from './Items';
import { ListError } from './ListError';
import { ListLoading } from './ListLoading';
import { styles } from './styles';

const SuspenseContainer = () => {
  const { query, cacheItems } = useQueryContext();
  const { data: items, isStale: isCachedItems } = useMusicListQuery(query);

  useEffect(() => {
    if (!items) {
      return;
    }

    cacheItems(items);
  }, [cacheItems, isCachedItems, items]);

  return <></>;
};

export const List = () => {
  const { cachedItems, isLoading } = useQueryContext();

  return (
    <section css={styles.list.container}>
      <ErrorBoundary fallback={<ListError />}>
        <Suspense fallback={<ListLoading />}>
          <SuspenseContainer />
        </Suspense>
      </ErrorBoundary>
      <ul
        css={[
          styles.list.innerContainer,
          isLoading && styles.list.loadingContainer,
        ]}
      >
        {cachedItems && cachedItems.length === 0 && <EmptyList />}
        {cachedItems && cachedItems.length > 0 && <Items items={cachedItems} />}
      </ul>
    </section>
  );
};
