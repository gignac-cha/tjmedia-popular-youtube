import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { SongItem } from './SongItem.tsx';
import { mockSongs } from '../../fixtures/mock-songs.ts';

const meta = {
  title: 'Components/SongList/SongItem',
  component: SongItem,
  parameters: {
    layout: 'padded',
  },
  args: {
    song: mockSongs[2],
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
    song: mockSongs[0],
    index: 0,
  },
};
