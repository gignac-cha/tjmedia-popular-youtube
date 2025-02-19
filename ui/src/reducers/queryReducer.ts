import dayjs, { Dayjs } from 'dayjs';
import { Reducer } from 'react';
import { typed } from '../utilities/common';
import { getType } from '../utilities/tjmedia';

const initialQuery = {
  type: typed<Type>('1'),
  start: dayjs().subtract(1, 'month'),
  end: dayjs(),
};
export const initialState = {
  ...initialQuery,
  type: getType(),
  start: dayjs(localStorage.getItem('start') ?? initialQuery.start),
  end: dayjs(localStorage.getItem('end') ?? initialQuery.end),
  isLoading: false,
  cachedItems: new Array<MusicItem>(),
};

type QueryAction =
  | { name: 'CHANGE_TYPE'; type: Type }
  | { name: 'CHANGE_START'; start: Dayjs }
  | { name: 'CHANGE_END'; end: Dayjs }
  | { name: 'RESET_QUERY' }
  | { name: 'CACHE_ITEMS'; items: MusicItem[] };

export const queryReducer: Reducer<typeof initialState, QueryAction> = (prevState, action) => {
  switch (action.name) {
    case 'CHANGE_TYPE':
      localStorage.setItem('type', action.type);
      return { ...prevState, type: action.type, isLoading: true };
    case 'CHANGE_START':
      localStorage.setItem('start', action.start.format('YYYY-MM'));
      return { ...prevState, start: action.start, isLoading: true };
    case 'CHANGE_END':
      localStorage.setItem('end', action.end.format('YYYY-MM'));
      return { ...prevState, end: action.end, isLoading: true };
    case 'RESET_QUERY':
      localStorage.setItem('type', initialQuery.type);
      localStorage.setItem('start', initialQuery.start.format('YYYY-MM'));
      localStorage.setItem('end', initialQuery.end.format('YYYY-MM'));
      return { ...prevState, ...initialQuery, isLoading: true };
    case 'CACHE_ITEMS':
      return { ...prevState, cachedItems: action.items, isLoading: false };
  }
};
