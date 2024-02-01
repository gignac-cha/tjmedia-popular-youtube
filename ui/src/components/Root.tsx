import { MainContextProvider } from '../contexts/MainContext';
import { List } from './Main/List';
import { Main } from './Main/Main';
import { Controls } from './Navigation/Controls';
import { Navigation } from './Navigation/Navigation';

export const Root = () => {
  return (
    <MainContextProvider>
      <header></header>
      <Navigation>
        <Controls />
      </Navigation>
      <Main>
        <List />
      </Main>
      <footer></footer>
    </MainContextProvider>
  );
};
