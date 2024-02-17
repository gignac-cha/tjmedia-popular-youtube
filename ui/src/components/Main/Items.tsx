import { Item } from './Item';

export const Items = ({ items }: { items: MusicItem[] }) => {
  return items.map((item: MusicItem, index: number) => (
    <Item key={index} item={item} />
  ));
};
