import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import {
  VideoContextProvider,
  useVideoContext,
} from '../../contexts/VideoContext';
import { Video } from './Video';

export default {
  component: Video,
} satisfies Meta;

const Section = styled.section`
  margin: auto;
  width: 40rem;
`;

const musicItems: MusicItem[] = [
  {
    index: 1,
    artist: '박효신',
    title: '동경',
  },
  {
    index: 2,
    artist: '나얼',
    title: '한번만더',
  },
];
const videoItems: VideoItem[] = [
  {
    title: '동경',
    videoId: 'xdQZqb0glnI',
    width: 640,
    height: 480,
  },
  {
    title: '동경',
    videoId: 'vTqcfqaVbaw',
    width: 640,
    height: 480,
  },
  {
    title: '동경',
    videoId: 'Tt2wFhjGQJ0',
    width: 640,
    height: 480,
  },
  {
    title: '동경 (Live)',
    videoId: 'mH84Lz8xNtc',
    width: 640,
    height: 480,
  },
  {
    title: '150215 - 박효신(Park Hyo Shin) - 동경',
    videoId: 'QvtBDsqqOHE',
    width: 640,
    height: 480,
  },
  {
    title: '박효신 - 동경(2001년 10월 25일)',
    videoId: 'HsUj3f_vJ54',
    width: 640,
    height: 480,
  },
];

const ContextContainer = () => {
  const { cacheItems, selectedIndex } = useVideoContext();
  const [index, setIndex] = useState(selectedIndex);
  useEffect(() => {
    cacheItems(videoItems);
  }, [cacheItems]);
  useEffect(() => {
    setIndex(selectedIndex);
  }, [selectedIndex]);
  return (
    <Video item={musicItems[0]}>
      <Video.Frame musicItem={musicItems[0]} videoItem={videoItems[index]} />
      <Video.Controls />
    </Video>
  );
};

export const Default: StoryObj<typeof Video> = {
  args: { item: musicItems[0] },
};

export const WithContextWithFrameAndControls: StoryObj<typeof Video> = {
  render: () => {
    return (
      <Section>
        <VideoContextProvider>
          <ContextContainer />
        </VideoContextProvider>
      </Section>
    );
  },
};
