import { useQueryContext } from '../../contexts/QueryContext';
import { Loading } from '../Loading/Loading';
import { EmptyList } from './EmptyList';
import { Item } from './Item';
import { styles } from './styles';

export const List = () => {
  const { isLoading, items } = useQueryContext();

  return (
    <section>
      <ul css={styles.list.container}>
        {isLoading && (
          <li>
            <Loading />
          </li>
        )}
        {items.length > 0 &&
          items.map((item: MusicItem, i: number) => (
            <Item key={i} item={item} />
          ))}
        {!isLoading && items.length === 0 && <EmptyList />}
      </ul>
    </section>
  );
};
