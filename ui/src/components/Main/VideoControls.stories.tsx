import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { PropsWithChildren, useEffect } from 'react';
import {
  VideoContextProvider,
  useVideoContext,
} from '../../contexts/VideoContext';
import { VideoControls } from './VideoControls';

export default {
  component: VideoControls,
} satisfies Meta;

const Section = styled.section`
  margin: auto;
  width: 40rem;
`;

const createFakeVideoItem = (index: number): VideoItem => ({
  title: `title-${index}`,
  videoId: `videoId${index}`,
  width: 640,
  height: 480,
});

const ContextContainer = ({
  children,
  count,
}: PropsWithChildren<{ count: number }>) => {
  const { cacheItems } = useVideoContext();
  useEffect(() => {
    const items = new Array(count)
      .fill(undefined)
      .map((_, index) => createFakeVideoItem(index));
    cacheItems(items);
  }, [cacheItems, count]);
  return children;
};

export const Empty: StoryObj<typeof VideoControls> = {};

export const WithContext: StoryObj<typeof VideoControls> = {
  render: () => (
    <Section>
      <VideoContextProvider>
        <ContextContainer count={10}>
          <VideoControls />
        </ContextContainer>
      </VideoContextProvider>
    </Section>
  ),
};
