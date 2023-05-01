import { FunctionComponent, useState } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { defaultValues, MainContext, MainContextValues } from '../contexts/main';
import { MusicItem } from '../utilities/tjmedia';
import { Controls, Type } from './controls';
import { List } from './list';

export interface MainProperties {}
export interface MainState {}

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

export const Main: FunctionComponent<MainProperties> = () => {
  const [type, setType] = useState<Type>(getType() ?? defaultValues.type);
  const [start, setStart] = useState<Dayjs>(dayjs(localStorage.getItem('start') ?? defaultValues.start));
  const [end, setEnd] = useState<Dayjs>(dayjs(localStorage.getItem('end') ?? defaultValues.end));
  const [isLoading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<MusicItem[]>(defaultValues.items);

  const initialValues: MainContextValues = {
    type,
    setType,
    start,
    setStart,
    end,
    setEnd,
    isLoading,
    setLoading,
    items,
    setItems,
  };
  return (
    <MainContext.Provider value={initialValues}>
      <Controls />
      <List />
    </MainContext.Provider>
  );
};
