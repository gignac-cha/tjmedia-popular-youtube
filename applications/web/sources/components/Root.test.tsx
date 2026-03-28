import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Root } from './Root.tsx';

describe('Root', () => {
  it('renders the product UI', () => {
    render(<Root />);

    expect(screen.getByText(/TJMedia/i)).toBeInTheDocument();
    expect(screen.getByText(/Charts/i)).toBeInTheDocument();
    expect(screen.getByText(/Ranking/i)).toBeInTheDocument();
  });
});
