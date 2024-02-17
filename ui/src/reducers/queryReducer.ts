import dayjs, { Dayjs } from 'dayjs';
import { Reducer } from 'react';
import { getType } from '../utilities/tjmedia';

const initialStateValues: typeof initialState = {
  type: '1',
  start: dayjs().subtract(1, 'month'),
  end: dayjs(),
};
export const initialState: {
  type: Type;
  start: Dayjs;
  end: Dayjs;
  cachedItems?: MusicItem[];
} = {
  type: getType(),
  start: dayjs(localStorage.getItem('start') ?? initialStateValues.start),
  end: dayjs(localStorage.getItem('end') ?? initialStateValues.end),
};

type QueryAction =
  | { name: 'CHANGE_TYPE'; type: Type }
  | { name: 'CHANGE_START'; start: Dayjs }
  | { name: 'CHANGE_END'; end: Dayjs }
  | { name: 'RESET' }
  | { name: 'CACHE'; items: MusicItem[] };

export const queryReducer: Reducer<typeof initialState, QueryAction> = (
  prevState,
  action,
) => {
  switch (action.name) {
    case 'CHANGE_TYPE':
      localStorage.setItem('type', action.type);
      return { ...prevState, type: action.type };
    case 'CHANGE_START':
      localStorage.setItem('start', action.start.format('YYYY-MM'));
      return { ...prevState, start: action.start };
    case 'CHANGE_END':
      localStorage.setItem('end', action.end.format('YYYY-MM'));
      return { ...prevState, end: action.end };
    case 'RESET':
      localStorage.setItem('type', initialStateValues.type);
      localStorage.setItem('start', initialStateValues.start.format('YYYY-MM'));
      localStorage.setItem('end', initialStateValues.end.format('YYYY-MM'));
      return { ...prevState, ...initialStateValues };
    case 'CACHE':
      return { ...prevState, cachedItems: action.items };
  }
};
