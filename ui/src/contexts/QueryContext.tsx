import { Dayjs } from 'dayjs';
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { initialState, queryReducer } from '../reducers/queryReducer';
import { doNothing, typed } from '../utilities/common';

const convertToQuery = ({ type, start, end }: typeof initialState) => {
  const [SYY, SMM]: string[] = start.format('YYYY-MM').split('-');
  const [EYY, EMM]: string[] = end.format('YYYY-MM').split('-');
  return { strType: type, SYY, SMM, EYY, EMM };
};

export const defaultValue = {
  ...initialState,
  changeType: typed<(type: Type) => void>(doNothing),
  changeStart: typed<(start: Dayjs) => void>(doNothing),
  changeEnd: typed<(end: Dayjs) => void>(doNothing),
  resetQuery: typed<() => void>(doNothing),
  query: typed<TJMediaQuery>(convertToQuery(initialState)),
  cacheItems: typed<(items: MusicItem[]) => void>(doNothing),
};

export const QueryContext = Object.assign(createContext(defaultValue), {
  Provider: ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(queryReducer, initialState);

    const query = useMemo(() => convertToQuery(state), [state]);

    return (
      <QueryContext
        value={{
          ...state,
          changeType: useCallback((type) => dispatch({ name: 'CHANGE_TYPE', type }), []),
          changeStart: useCallback((start) => dispatch({ name: 'CHANGE_START', start }), []),
          changeEnd: useCallback((end) => dispatch({ name: 'CHANGE_END', end }), []),
          resetQuery: useCallback(() => dispatch({ name: 'RESET_QUERY' }), []),
          query,
          cacheItems: useCallback((items) => dispatch({ name: 'CACHE_ITEMS', items }), []),
        }}
      >
        {children}
      </QueryContext>
    );
  },
});

export const useQueryContext = () => useContext(QueryContext);
