import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { BottomSheet } from './BottomSheet.tsx';

const meta = {
  title: 'Components/Shared/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    children: (
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Bottom Sheet Content</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          This is an example of content inside the BottomSheet component.
        </p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    children: (
      <div style={{ padding: '1rem' }}>
        <p>This content is not visible when closed.</p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  args: {
    isOpen: true,
    children: (
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Select an option</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {['Option A', 'Option B', 'Option C'].map((option) => (
            <li
              key={option}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
};
