import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { PropsWithChildren, useEffect } from 'react';
import {
  VideoContextProvider,
  useVideoContext,
} from '../../contexts/VideoContext';
import { VideoFrame } from './VideoFrame';

export default {
  component: VideoFrame,
} satisfies Meta;

const Section = styled.section`
  margin: auto;
  width: 40rem;
`;

const musicItems: MusicItem[] = [
  {
    index: 1,
    artist: '아이유',
    title: '밤편지',
  },
  {
    index: 2,
    artist: '나얼',
    title: '한번만더',
  },
];
const videoItems: VideoItem[] = [
  {
    title: '[MV] IU(아이유) _ Through the Night(밤편지)',
    videoId: 'BzYnNdJhZQw',
    width: 640,
    height: 480,
  },
  {
    title: '한번만 더',
    videoId: 'i42RJVSU6K0',
    width: 640,
    height: 480,
  },
];

const ContextContainer = ({ children }: PropsWithChildren) => {
  const { cacheItems } = useVideoContext();
  useEffect(() => {
    cacheItems(videoItems);
  }, [cacheItems]);
  return children;
};

export const Default: StoryObj<typeof VideoFrame> = {
  args: { musicItem: musicItems[0] },
};

export const WithValue: StoryObj<typeof VideoFrame> = {
  args: { musicItem: musicItems[0], videoItem: videoItems[0] },
};

export const WithContextWithValue: StoryObj<typeof VideoFrame> = {
  args: { musicItem: musicItems[0], videoItem: videoItems[0] },
  render: ({ musicItem, videoItem }) => (
    <Section>
      <VideoContextProvider>
        <ContextContainer>
          <VideoFrame musicItem={musicItem} videoItem={videoItem} />
        </ContextContainer>
      </VideoContextProvider>
    </Section>
  ),
};

export const WithContextWithValueWithIndex: StoryObj<{ index: number }> = {
  args: { index: 0 },
  render: ({ index }) => (
    <Section>
      <VideoContextProvider>
        <ContextContainer>
          <VideoFrame
            musicItem={musicItems[index]}
            videoItem={videoItems[index]}
          />
        </ContextContainer>
      </VideoContextProvider>
    </Section>
  ),
};
