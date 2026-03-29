import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import type { TJMediaItem } from '../../types/tjmedia.ts';
import { SongList } from './SongList.tsx';

const mockSongs: TJMediaItem[] = [
  {
    rank: '1',
    pro: 10001,
    indexTitle: 'Supernova',
    indexSong: 'aespa (에스파)',
    word: 'Supernova',
    com: 'SM',
    imgthumb_path: 'https://via.placeholder.com/48',
    mv_yn: 'Y',
  },
  {
    rank: '2',
    pro: 10002,
    indexTitle: 'APT.',
    indexSong: 'ROSE (로제)',
    word: 'APT',
    com: 'YG',
    imgthumb_path: 'https://via.placeholder.com/48',
    mv_yn: 'Y',
  },
  {
    rank: '3',
    pro: 10003,
    indexTitle: 'Whiplash',
    indexSong: 'aespa (에스파)',
    word: 'Whiplash',
    com: 'SM',
    imgthumb_path: 'https://via.placeholder.com/48',
    mv_yn: 'Y',
  },
  {
    rank: '4',
    pro: 10004,
    indexTitle: 'Magnetic',
    indexSong: 'ILLIT (아일릿)',
    word: 'Magnetic',
    com: 'HYBE',
    imgthumb_path: 'https://via.placeholder.com/48',
    mv_yn: 'Y',
  },
  {
    rank: '5',
    pro: 10005,
    indexTitle: 'How Sweet',
    indexSong: 'NewJeans (뉴진스)',
    word: 'How Sweet',
    com: 'ADOR',
    imgthumb_path: 'https://via.placeholder.com/48',
    mv_yn: 'Y',
  },
];

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
