import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import type { TJMediaItem } from '../../types/tjmedia.ts';
import {
  StyledSongItem,
  Rank,
  GoldRank,
  SelectedRank,
  Equalizer,
  EqualizerBar,
  ThumbnailContainer,
  Thumbnail,
  PlayOverlay,
  SongInfo,
  SongTitle,
  SongArtist,
} from './styles.ts';

export function SongItem({
  song,
  index,
  isSelected,
  isPlaying,
  onSelect,
}: {
  song: TJMediaItem;
  index: number;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}) {
  const isFirstPlace = song.rank === '1';

  return (
    <StyledSongItem
      className="song-item"
      isSelected={isSelected}
      index={index}
      data-selected={isSelected}
      onClick={onSelect}
    >
      <Rank>
        {isSelected ? (
          isPlaying ? (
            <Equalizer>
              <EqualizerBar delay={0} />
              <EqualizerBar delay={0.2} />
              <EqualizerBar delay={0.4} />
            </Equalizer>
          ) : (
            <SelectedRank>
              <FontAwesomeIcon icon={faPlay} />
            </SelectedRank>
          )
        ) : isFirstPlace ? (
          <GoldRank>{song.rank}</GoldRank>
        ) : (
          song.rank
        )}
      </Rank>
      <ThumbnailContainer>
        {song.imgthumb_path ? (
          <Thumbnail
            src={song.imgthumb_path}
            alt={song.indexTitle}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          />
        )}
        <PlayOverlay>
          <FontAwesomeIcon icon={faPlay} />
        </PlayOverlay>
      </ThumbnailContainer>
      <SongInfo>
        <SongTitle>{song.indexTitle}</SongTitle>
        <SongArtist>{song.indexSong}</SongArtist>
      </SongInfo>
    </StyledSongItem>
  );
}
