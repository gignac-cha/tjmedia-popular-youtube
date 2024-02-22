import { VideoContextProvider } from '../../contexts/VideoContext';
import { Item } from './Item';

export const Items = ({ items }: { items: MusicItem[] }) => {
  return (
    <>
      {items.map((item: MusicItem, index: number) => (
        <VideoContextProvider key={index}>
          <Item item={item} />
        </VideoContextProvider>
      ))}
    </>
  );
};
