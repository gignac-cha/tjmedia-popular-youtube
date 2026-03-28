import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { Header } from './Header.tsx';
import { buildThisMonthDateRange } from '../../tools/dates.ts';
import type { SearchForm } from '../../types/tjmedia.ts';

const thisMonthRange = buildThisMonthDateRange();

const defaultSearchForm: SearchForm = {
  chartType: 'TOP',
  strType: '1',
  ...thisMonthRange,
};

const meta = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSearchFormChange: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchForm: defaultSearchForm,
  },
};

export const English: Story = {
  args: {
    searchForm: {
      ...defaultSearchForm,
      strType: '2',
    },
  },
};

export const Japanese: Story = {
  args: {
    searchForm: {
      ...defaultSearchForm,
      strType: '3',
    },
  },
};
