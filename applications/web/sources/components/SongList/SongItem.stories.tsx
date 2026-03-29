import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import type { TJMediaItem } from '../../types/tjmedia.ts';
import { SongItem } from './SongItem.tsx';

const mockSong: TJMediaItem = {
  rank: '3',
  pro: 12345,
  indexTitle: 'APT.',
  indexSong: 'ROSE (로제)',
  word: 'APT',
  com: 'YG',
  imgthumb_path: 'https://via.placeholder.com/48',
  mv_yn: 'Y',
};

const firstPlaceSong: TJMediaItem = {
  ...mockSong,
  rank: '1',
  pro: 99999,
  indexTitle: 'Supernova',
  indexSong: 'aespa (에스파)',
};

const meta = {
  title: 'Components/SongList/SongItem',
  component: SongItem,
  parameters: {
    layout: 'padded',
  },
  args: {
    song: mockSong,
    index: 2,
    isSelected: false,
    isPlaying: false,
    onSelect: fn(),
  },
} satisfies Meta<typeof SongItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const Playing: Story = {
  args: {
    isSelected: true,
    isPlaying: true,
  },
};

export const FirstPlace: Story = {
  args: {
    song: firstPlaceSong,
    index: 0,
  },
};
