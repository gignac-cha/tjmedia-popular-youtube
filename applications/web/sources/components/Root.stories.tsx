import type { Meta, StoryObj } from '@storybook/react';

import { Root } from './Root.tsx';

const meta = {
  title: 'Components/Root',
  component: Root,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
