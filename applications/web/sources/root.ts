import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Root } from './components/Index.tsx';

export function initializeRoot(): void {
  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    throw new Error('Root element #root was not found.');
  }

  createRoot(rootElement).render(
    createElement(StrictMode, null, createElement(Root)),
  );
}
