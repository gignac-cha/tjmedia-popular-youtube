import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Main } from './components/Main';

export const initializeRoot = () =>
  createRoot(document.body.appendChild(document.querySelector('main') ?? document.createElement('main'))).render(createElement(Main));
