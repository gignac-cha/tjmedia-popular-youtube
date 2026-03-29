import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ApplicationView } from './ApplicationView.tsx';
import { buildThisMonthDateRange } from '../tools/dates.ts';
import { mockSongs } from '../fixtures/mock-songs.ts';

const thisMonthRange = buildThisMonthDateRange();

const meta = {
  title: 'Components/ApplicationView',
  component: ApplicationView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    searchForm: {
      chartType: 'TOP',
      strType: '1',
      ...thisMonthRange,
    },
    songs: mockSongs,
    isPending: false,
    isError: false,
    isPlaying: false,
    selectedSong: null,
    onSearchFormChange: fn(),
    onSelectSong: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof ApplicationView>;

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
    errorMessage: 'Failed to fetch chart data.',
    songs: [],
  },
};

export const WithSelectedSong: Story = {
  args: {
    selectedSong: mockSongs[0],
    playerSlot: (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Player placeholder for &quot;{mockSongs[0].indexTitle} - {mockSongs[0].indexSong}&quot;
      </div>
    ),
  },
};
