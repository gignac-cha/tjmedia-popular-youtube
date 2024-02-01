import dayjs, { Dayjs } from 'dayjs';
import { FunctionComponent, useState } from 'react';
import {
  MainContext,
  MainContextValues,
  defaultValues,
} from '../../contexts/MainContext';
import { getType } from '../../utilities/tjmedia';
import { Controls } from '../Navigation/Controls';
import { List } from './List';

export interface MainProperties {}
export interface MainState {}

export const Main: FunctionComponent<MainProperties> = () => {
  const [type, setType] = useState<Type>(getType() ?? defaultValues.type);
  const [start, setStart] = useState<Dayjs>(
    dayjs(localStorage.getItem('start') ?? defaultValues.start)
  );
  const [end, setEnd] = useState<Dayjs>(
    dayjs(localStorage.getItem('end') ?? defaultValues.end)
  );
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
