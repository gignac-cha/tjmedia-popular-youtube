import { css } from '@emotion/react';
import { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import {
  VideoContextProvider,
  useVideoContext,
} from '../../contexts/VideoContext';
import { VideoControls } from './VideoControls';

export default {
  component: VideoControls,
} satisfies Meta;

export const Empty: StoryObj<typeof VideoControls> = {};

export const WithContext: StoryObj<typeof VideoControls> = {
  render: () => {
    const Container = () => {
      const { cacheItems } = useVideoContext();
      useEffect(() => {
        cacheItems(
          new Array(10).fill(undefined).map((_, index) => ({
            title: `title-${index}`,
            videoId: `videoId${index}`,
            width: 640,
            height: 480,
          })),
        );
      }, [cacheItems]);
      return <VideoControls />;
    };
    return (
      <section
        css={css`
          margin: auto;
          width: 40rem;
        `}
      >
        <VideoContextProvider>
          <Container />
        </VideoContextProvider>
      </section>
    );
  },
};
