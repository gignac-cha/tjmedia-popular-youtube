import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { VideoPlayerView } from './VideoPlayerView.tsx';
import type { YouTubeItem } from '../../types/youtube.ts';

const mockVideos: YouTubeItem[] = [
  {
    videoId: 'abc123',
    title: 'Drowning - WOODZ Official MV',
    thumbnailUrl: 'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
    source: 'topic',
    width: 480,
    height: 360,
  },
  {
    videoId: 'def456',
    title: 'Drowning - WOODZ Live Performance',
    thumbnailUrl: 'https://i.ytimg.com/vi/def456/hqdefault.jpg',
    source: 'plain',
    width: 480,
    height: 360,
  },
];

const meta = {
  title: 'Components/Player/VideoPlayerView',
  component: VideoPlayerView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    videos: mockVideos,
    isPending: false,
    isError: false,
    query: 'Drowning WOODZ',
    songTitle: 'Drowning',
    artist: 'WOODZ',
    playerState: 'paused',
    onContainerReady: fn(),
    onVideoChange: fn(),
  },
} satisfies Meta<typeof VideoPlayerView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playing: Story = {
  args: {
    playerState: 'playing',
  },
};

export const Loading: Story = {
  args: {
    isPending: true,
    videos: [],
  },
};

export const Error: Story = {
  args: {
    isError: true,
    errorMessage: 'YouTube search failed.',
    videos: [],
  },
};

export const NoResults: Story = {
  args: {
    videos: [],
  },
};

export const SingleVideo: Story = {
  args: {
    videos: [mockVideos[0]],
  },
};
