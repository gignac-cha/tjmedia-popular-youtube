import { FunctionComponent, useState } from 'react';

import { Dayjs } from 'dayjs';

import { defaultValues, MainContext, MainContextValues } from '../contexts/main';
import { MusicItem } from '../utilities/tjmedia';
import { Controls, Type } from './controls';
import { List } from './list';
import { EmptyList } from './emptyList';

export interface MainProperties {}
export interface MainState {}

export const Main: FunctionComponent<MainProperties> = () => {
  const [type, setType] = useState<Type>(defaultValues.type);
  const [start, setStart] = useState<Dayjs>(defaultValues.start);
  const [end, setEnd] = useState<Dayjs>(defaultValues.end);
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
