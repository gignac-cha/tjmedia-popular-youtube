import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { SongList } from './SongList.tsx';
import { mockSongs } from '../../fixtures/mock-songs.ts';

const meta = {
  title: 'Components/SongList/SongList',
  component: SongList,
  parameters: {
    layout: 'padded',
  },
  args: {
    songs: mockSongs,
    isPending: false,
    isError: false,
    errorMessage: undefined,
    selectedSong: null,
    isPlaying: false,
    onSelectSong: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof SongList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isPending: true,
    songs: [],
  },
};

export const Error: Story = {
  args: {
    isError: true,
    errorMessage: 'Failed to fetch chart data. Please try again later.',
    songs: [],
  },
};

export const Empty: Story = {
  args: {
    songs: [],
  },
};

export const WithSelectedSong: Story = {
  args: {
    selectedSong: mockSongs[2],
  },
};

export const WithPlayingSong: Story = {
  args: {
    selectedSong: mockSongs[0],
    isPlaying: true,
  },
};
