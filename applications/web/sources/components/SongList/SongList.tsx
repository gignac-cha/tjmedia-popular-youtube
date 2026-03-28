import type { TjmediaItem } from '../../types/tjmedia.ts';
import { buildChartErrorMessage } from '../../services/tjmedia.ts';
import { Subtitle, EmptyState, ErrorMessage } from '../shared/styles.ts';
import { ListSection, ListHeader } from './styles.ts';
import { SkeletonList } from './SkeletonList.tsx';
import { SongItem } from './SongItem.tsx';

export function SongList({
  songs,
  isPending,
  isError,
  errorMessage,
  selectedSong,
  isPlaying,
  onSelectSong,
}: {
  songs: TjmediaItem[];
  isPending: boolean;
  isError: boolean;
  errorMessage: string | undefined;
  selectedSong: TjmediaItem | null;
  isPlaying: boolean;
  onSelectSong: (song: TjmediaItem) => void;
}) {
  return (
    <ListSection>
      <ListHeader>
        <Subtitle>Ranking</Subtitle>
      </ListHeader>

      {isPending && <SkeletonList />}

      {isError && errorMessage && (
        <ErrorMessage>{buildChartErrorMessage(errorMessage)}</ErrorMessage>
      )}

      {!isPending && !isError && songs.length === 0 && (
        <EmptyState>
          <p>No songs found for this period.</p>
        </EmptyState>
      )}

      {!isPending &&
        !isError &&
        songs.map((song, index) => {
          const isSelected = selectedSong?.pro === song.pro;
          return (
            <SongItem
              key={`${song.pro}-${song.rank}`}
              song={song}
              index={index}
              isSelected={isSelected}
              isPlaying={isSelected && isPlaying}
              onSelect={() => onSelectSong(song)}
            />
          );
        })}
    </ListSection>
  );
}
