import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

export default {
  component: Button,
} satisfies Meta;

export const Default: StoryObj<typeof Button> = {};

export const WithText: StoryObj<typeof Button> = {
  render: () => <Button>Text</Button>,
};

export const WithIconAndText: StoryObj<typeof Button> = {
  render: () => (
    <Button>
      <FontAwesomeIcon icon={faSearch} /> Search
    </Button>
  ),
};
