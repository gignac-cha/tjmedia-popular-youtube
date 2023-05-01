import { createContext, useContext } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { ControlsProperties, ControlsState, Type } from '../components/controls';
import { ListProperties, ListState } from '../components/list';
import { MainProperties, MainState } from '../components/main';

export type MainContextProperties = MainProperties & ListProperties & ControlsProperties;
export type MainContextStates = MainState & ListState & ControlsState;
export type MainContextValues = MainContextProperties & MainContextStates;

const doNothing = () => {};

const getType = (): Type => {
  switch (localStorage.getItem('type')) {
    default:
    case '1':
      return '1';
    case '2':
      return '2';
    case '3':
      return '3';
  }
};

const type: Type = getType();
const today: Dayjs = dayjs();
const start: Dayjs = dayjs(localStorage.getItem('start') ?? today.subtract(1, 'month').format('YYYY-MM'));
const end: Dayjs = dayjs(localStorage.getItem('end') ?? today.format('YYYY-MM'));

export const defaultValues: MainContextValues = {
  type,
  setType: doNothing,
  start,
  setStart: doNothing,
  end,
  setEnd: doNothing,
  isLoading: false,
  setLoading: doNothing,
  items: [],
  setItems: doNothing,
};

export const MainContext = createContext<MainContextValues>(defaultValues);

export const useMainContext = () => useContext(MainContext);
