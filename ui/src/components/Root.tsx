import { QueryContextProvider } from '../contexts/QueryContext';
import { List } from './Main/List';
import { Main } from './Main/Main';
import { Controls } from './Navigation/Controls';
import { Navigation } from './Navigation/Navigation';

export const Root = () => {
  return (
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
  );
};
