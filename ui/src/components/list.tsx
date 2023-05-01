import { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { useMainContext } from '../contexts/main';

import { MusicItem } from '../utilities/tjmedia';
import { Item } from './item';
import { Loading } from './loading';

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
      {items.map((item: MusicItem, i: number) => (
        <Item key={i} item={item} />
      ))}
    </div>
  );
};
