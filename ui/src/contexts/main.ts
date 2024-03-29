import { createContext, useContext } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { ControlsProperties, ControlsState, Type } from '../components/Controls';
import { ListProperties, ListState } from '../components/List';
import { MainProperties, MainState } from '../components/Main';

export type MainContextProperties = MainProperties & ListProperties & ControlsProperties;
export type MainContextStates = MainState & ListState & ControlsState;
export type MainContextValues = MainContextProperties & MainContextStates;

const doNothing = () => {
  // DO NOTHING
};

export const defaultValues: MainContextValues = {
  type: '1',
  setType: doNothing,
  start: dayjs().subtract(1, 'month'),
  setStart: doNothing,
  end: dayjs(),
  setEnd: doNothing,
  isLoading: false,
  setLoading: doNothing,
  items: [],
  setItems: doNothing,
};

export const MainContext = createContext<MainContextValues>(defaultValues);

export const useMainContext = () => useContext(MainContext);
