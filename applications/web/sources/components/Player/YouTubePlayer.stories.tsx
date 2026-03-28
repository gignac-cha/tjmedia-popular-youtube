import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { YouTubePlayer } from './YouTubePlayer.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Components/Player/YouTubePlayer',
  component: YouTubePlayer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onPlayerStateChange: fn(),
  },
} satisfies Meta<typeof YouTubePlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    query: 'Drowning WOODZ',
    songTitle: 'Drowning',
    artist: 'WOODZ',
  },
};
