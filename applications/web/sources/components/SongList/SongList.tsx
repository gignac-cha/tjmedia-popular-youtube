import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import type { TJMediaItem } from '../../types/tjmedia.ts';
import { buildChartErrorMessage } from '../../services/tjmedia.ts';
import { Subtitle, EmptyState, ErrorContainer, ErrorMessage, RetryButton } from '../shared/styles.ts';
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
  onRetry,
}: {
  songs: TJMediaItem[];
  isPending: boolean;
  isError: boolean;
  errorMessage: string | undefined;
  selectedSong: TJMediaItem | null;
  isPlaying: boolean;
  onSelectSong: (song: TJMediaItem) => void;
  onRetry?: () => void;
}) {
  return (
    <ListSection data-testid="song-list-section">
      <ListHeader data-testid="song-list-header">
        <Subtitle>Ranking</Subtitle>
      </ListHeader>

      {isPending && <SkeletonList />}

      {isError && (
        <ErrorContainer role="alert" data-testid="song-list-error">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <ErrorMessage>
            {errorMessage !== undefined
              ? buildChartErrorMessage(errorMessage)
              : 'Failed to load charts.'}
          </ErrorMessage>
          {onRetry !== undefined && (
            <RetryButton onClick={onRetry} data-testid="song-list-retry-button">다시 시도</RetryButton>
          )}
        </ErrorContainer>
      )}

      {!isPending && !isError && songs.length === 0 && (
        <EmptyState data-testid="song-list-empty">
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
