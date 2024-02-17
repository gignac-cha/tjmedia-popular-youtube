import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryContextProvider } from '../contexts/QueryContext';
import { List } from './Main/List';
import { Main } from './Main/Main';
import { Controls } from './Navigation/Controls';
import { Navigation } from './Navigation/Navigation';

const queryClient = new QueryClient();

export const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryContextProvider>
        <header></header>
        <Navigation>
          <Controls />
        </Navigation>
        <Main>
          <List />
        </Main>
        <footer></footer>
      </QueryContextProvider>
    </QueryClientProvider>
  );
};
