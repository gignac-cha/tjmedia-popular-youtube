import dayjs, { Dayjs } from 'dayjs';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';
import { doNothing } from '../utilities/common';
import { getType } from '../utilities/tjmedia';

export const defaultValues: {
  type: Type;
  setType: Dispatch<SetStateAction<Type>>;
  start: Dayjs;
  setStart: Dispatch<SetStateAction<Dayjs>>;
  end: Dayjs;
  setEnd: Dispatch<SetStateAction<Dayjs>>;
  isLoading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  items: MusicItem[];
  setItems: Dispatch<SetStateAction<MusicItem[]>>;
} = {
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

const MainContext = createContext<typeof defaultValues>(defaultValues);

export const MainContextProvider = ({ children }: PropsWithChildren) => {
  const [type, setType] = useState<Type>(getType() ?? defaultValues.type);
  const [start, setStart] = useState<Dayjs>(
    dayjs(localStorage.getItem('start') ?? defaultValues.start)
  );
  const [end, setEnd] = useState<Dayjs>(
    dayjs(localStorage.getItem('end') ?? defaultValues.end)
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<MusicItem[]>(defaultValues.items);

  return (
    <MainContext.Provider
      value={{
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
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
