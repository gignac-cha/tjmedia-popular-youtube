import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import { List } from './Main/List';
import { Main } from './Main/Main';
import { Controls } from './Navigation/Controls';
import { Navigation } from './Navigation/Navigation';

const queryClient = new QueryClient();

export const Root = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <QueryContext.Provider>
          <header></header>
          <Navigation>
            <Controls />
          </Navigation>
          <Main>
            <List />
          </Main>
          <footer></footer>
        </QueryContext.Provider>
      </QueryClientProvider>
    </StrictMode>
  );
};
