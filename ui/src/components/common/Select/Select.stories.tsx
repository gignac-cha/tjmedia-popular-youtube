import { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

export default {
  title: 'Select',
  component: Select,
} satisfies Meta;

export const Empty: StoryObj<typeof Select> = {};

export const WithOptions: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <Select.Option>Item 1</Select.Option>
      <Select.Option>Item 2</Select.Option>
      <Select.Option>Item 3</Select.Option>
    </Select>
  ),
};
