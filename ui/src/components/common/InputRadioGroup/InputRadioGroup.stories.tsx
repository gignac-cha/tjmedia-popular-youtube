import { Meta, StoryObj } from '@storybook/react';
import { InputRadioGroup } from './InputRadioGroup';

export default {
  component: InputRadioGroup,
} satisfies Meta;

export const Default: StoryObj<typeof InputRadioGroup> = {};

export const WithOptions: StoryObj<typeof InputRadioGroup> = {
  render: () => (
    <InputRadioGroup name="type" defaultValue={'2'}>
      <InputRadioGroup.Option value={'1'}>가요</InputRadioGroup.Option>
      <InputRadioGroup.Option value={'2'}>POP</InputRadioGroup.Option>
      <InputRadioGroup.Option value={'3'}>JPOP</InputRadioGroup.Option>
    </InputRadioGroup>
  ),
};
