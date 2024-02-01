import { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { useMainContext } from '../../contexts/MainContext';
import { Loading } from '../Loading/Loading';
import { EmptyList } from './EmptyList';
import { Item } from './Item';

export interface ListProperties {}
export interface ListState {
  isLoading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  items: MusicItem[];
  setItems: Dispatch<SetStateAction<MusicItem[]>>;
}

export const List: FunctionComponent<ListProperties> = () => {
  const { isLoading, items } = useMainContext();
  return (
    <div id="list">
      <Loading isLoading={isLoading} />
      {items.length > 0 &&
        items.map((item: MusicItem, i: number) => <Item key={i} item={item} />)}
      {!isLoading && items.length === 0 && <EmptyList />}
    </div>
  );
};
