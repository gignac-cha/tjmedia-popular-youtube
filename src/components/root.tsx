import { createRoot } from 'react-dom/client';
import { Main } from './main';

export const initializeRoot = () =>
  createRoot(
    document.body.appendChild(
      document.querySelector('main') ?? document.createElement('main'),
    ),
  ).render(<Main />);
