import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './components/Root';

const createRootElement = (id: string) => {
  const element = document.createElement('div');
  element.setAttribute('id', id);
  return document.body.appendChild(element);
};

export const initializeRoot = () =>
  createRoot(
    document.querySelector('#root') ?? createRootElement('root')
  ).render(createElement(Root));
