import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ApplicationView } from './ApplicationView.tsx';
import { buildThisMonthDateRange } from '../tools/dates.ts';
import type { TJMediaItem } from '../types/tjmedia.ts';

const thisMonthRange = buildThisMonthDateRange();

const mockSongs: TJMediaItem[] = [
  {
    rank: '1',
    pro: 10001,
    indexTitle: 'Drowning',
    indexSong: 'WOODZ (조승연)',
    word: 'Drowning',
    com: 'YUEHUA',
    imgthumb_path: '',
    mv_yn: 'Y',
  },
  {
    rank: '2',
    pro: 10002,
    indexTitle: 'APT.',
    indexSong: 'ROSE (로제)',
    word: 'APT',
    com: 'YG',
    imgthumb_path: '',
    mv_yn: 'Y',
  },
  {
    rank: '3',
    pro: 10003,
    indexTitle: 'Supernova',
    indexSong: 'aespa (에스파)',
    word: 'Supernova',
    com: 'SM',
    imgthumb_path: '',
    mv_yn: 'Y',
  },
];

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
    selectedSong: null,
    onSearchFormChange: fn(),
    onSelectSong: fn(),
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
  },
};
