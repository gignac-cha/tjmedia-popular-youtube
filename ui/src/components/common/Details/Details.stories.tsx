import { Meta, StoryObj } from '@storybook/react';
import { Details } from './Details';

export default {
  component: Details,
} satisfies Meta;

export const Empty: StoryObj<typeof Details> = {};

export const WithSummary: StoryObj<typeof Details> = {
  render: () => (
    <Details>
      <Details.Summary></Details.Summary>
    </Details>
  ),
};

export const WithSummaryWithText: StoryObj<typeof Details> = {
  render: () => (
    <Details>
      <Details.Summary>Summary</Details.Summary>
      Content
    </Details>
  ),
};
