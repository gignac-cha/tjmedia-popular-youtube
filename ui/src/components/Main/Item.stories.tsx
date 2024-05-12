import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { VideoContextProvider } from '../../contexts/VideoContext';
import { Item } from './Item';
import { styles } from './styles';

export default {
  component: Item,
} satisfies Meta;

const Section = styled.section`
  margin: auto;
  width: 40rem;
`;

const musicItems: MusicItem[] = [
  {
    index: 1,
    artist: '나얼',
    title: '한번만더',
  },
  {
    index: 10,
    artist: '김범수',
    title: '보고싶다',
  },
  {
    index: 99,
    artist: '박효신',
    title: '눈의꽃',
  },
];

export const Default: StoryObj<typeof Item> = {
  render: () => (
    <Section>
      <ul css={[styles.list.innerContainer]}>
        <Item item={musicItems[0]} />
        <Item item={musicItems[1]} />
        <Item item={musicItems[2]} />
      </ul>
    </Section>
  ),
};

export const WithVideoContext: StoryObj<typeof Item> = {
  render: () => (
    <Section>
      <VideoContextProvider>
        <ul css={[styles.list.innerContainer]}>
          <Item item={musicItems[0]} />
          <Item item={musicItems[1]} />
          <Item item={musicItems[2]} />
        </ul>
      </VideoContextProvider>
    </Section>
  ),
};
