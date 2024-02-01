import { useQueryContext } from '../../contexts/QueryContext';
import { Loading } from '../Loading/Loading';
import { EmptyList } from './EmptyList';
import { Item } from './Item';

export const List = () => {
  const { isLoading, items } = useQueryContext();

  return (
    <ul id="list">
      <Loading isLoading={isLoading} />
      {items.length > 0 &&
        items.map((item: MusicItem, i: number) => <Item key={i} item={item} />)}
      {!isLoading && items.length === 0 && <EmptyList />}
    </ul>
  );
};
