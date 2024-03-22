import { Meta, StoryObj } from '@storybook/react';
import { ChangeEvent, useState } from 'react';
import { Select } from './Select';

export default {
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

export const WithOptionsWithValue: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <Select.Option value={1}>Item 1</Select.Option>
      <Select.Option value={2}>Item 2</Select.Option>
      <Select.Option value={3}>Item 3</Select.Option>
    </Select>
  ),
};

export const WithOptionsWithValueWithDefaultValue: StoryObj<typeof Select> = {
  render: () => (
    <Select defaultValue={2}>
      <Select.Option value={1}>Item 1</Select.Option>
      <Select.Option value={2}>Item 2</Select.Option>
      <Select.Option value={3}>Item 3</Select.Option>
    </Select>
  ),
};

export const WithOptionsWithValueWithDefaultValueWithOnChange: StoryObj<
  typeof Select
> = {
  render: () => {
    const Container = () => {
      const [selectedValue, setSelectedValue] = useState(3);
      return (
        <>
          <Select
            defaultValue={selectedValue}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedValue(parseInt(event.currentTarget.value))
            }
          >
            <Select.Option value={1}>Item 1</Select.Option>
            <Select.Option value={2}>Item 2</Select.Option>
            <Select.Option value={3}>Item 3</Select.Option>
          </Select>
          <pre>Selected Value: {selectedValue}</pre>
        </>
      );
    };
    return <Container />;
  },
};
