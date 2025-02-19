import { VideoContext } from '../../contexts/VideoContext';
import { Item } from './Item';

export const Items = ({ items }: { items: MusicItem[] }) => {
  return (
    <>
      {items.map((item: MusicItem, index: number) => (
        <VideoContext.Provider key={index}>
          <Item item={item} />
        </VideoContext.Provider>
      ))}
    </>
  );
};
