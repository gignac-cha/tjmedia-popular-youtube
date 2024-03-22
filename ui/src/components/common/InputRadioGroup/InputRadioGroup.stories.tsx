import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { InputRadioGroup } from './InputRadioGroup';

export default {
  component: InputRadioGroup,
} satisfies Meta;

const Section = styled.section`
  margin: auto;
  width: 40rem;
`;

export const Default: StoryObj<typeof InputRadioGroup> = {};

export const WithOptions: StoryObj<typeof InputRadioGroup> = {
  render: () => (
    <Section>
      <InputRadioGroup name="type" defaultValue={'2'}>
        <InputRadioGroup.Option value={'1'}>가요</InputRadioGroup.Option>
        <InputRadioGroup.Option value={'2'}>POP</InputRadioGroup.Option>
        <InputRadioGroup.Option value={'3'}>JPOP</InputRadioGroup.Option>
      </InputRadioGroup>
    </Section>
  ),
};
