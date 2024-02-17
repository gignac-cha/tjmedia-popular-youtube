import { Dayjs } from 'dayjs';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { initialState, queryReducer } from '../reducers/queryReducer';
import { doNothing } from '../utilities/common';

const convertToQuery = ({
  type,
  start,
  end,
}: typeof initialState): TJMediaQuery => {
  const [SYY, SMM]: string[] = start.format('YYYY-MM').split('-');
  const [EYY, EMM]: string[] = end.format('YYYY-MM').split('-');
  return { strType: type, SYY, SMM, EYY, EMM };
};

export const defaultValue: typeof initialState & {
  changeType: (type: Type) => void;
  changeStart: (start: Dayjs) => void;
  changeEnd: (end: Dayjs) => void;
  reset: () => void;
  query: TJMediaQuery;
  cache: (items: MusicItem[]) => void;
} = {
  ...initialState,
  changeType: doNothing,
  changeStart: doNothing,
  changeEnd: doNothing,
  reset: doNothing,
  query: convertToQuery(initialState),
  cache: doNothing,
};

const QueryContext = createContext<typeof defaultValue>(defaultValue);

export const QueryContextProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(queryReducer, initialState);

  const changeType = useCallback(
    (type: Type) => dispatch({ name: 'CHANGE_TYPE', type }),
    [],
  );
  const changeStart = useCallback(
    (start: Dayjs) => dispatch({ name: 'CHANGE_START', start }),
    [],
  );
  const changeEnd = useCallback(
    (end: Dayjs) => dispatch({ name: 'CHANGE_END', end }),
    [],
  );
  const reset = useCallback(() => dispatch({ name: 'RESET' }), []);
  const cache = useCallback(
    (items: MusicItem[]) => dispatch({ name: 'CACHE', items }),
    [],
  );

  const query = useMemo(() => convertToQuery(state), [state]);

  return (
    <QueryContext.Provider
      value={{
        ...state,
        changeType,
        changeStart,
        changeEnd,
        reset,
        query,
        cache,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export const useQueryContext = () => useContext(QueryContext);
