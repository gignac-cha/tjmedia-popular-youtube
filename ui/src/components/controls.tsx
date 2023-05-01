/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';

import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';

import { defaultValues, useMainContext } from '../contexts/main';
import { getMusicList } from '../utilities/tjmedia';

export type Type = '1' | '2' | '3';
export interface ControlsProperties {}
export interface ControlsState {
  type: Type;
  setType: Dispatch<SetStateAction<Type>>;
  start: Dayjs;
  setStart: Dispatch<SetStateAction<Dayjs>>;
  end: Dayjs;
  setEnd: Dispatch<SetStateAction<Dayjs>>;
}

export const Controls: FunctionComponent<ControlsProperties> = () => {
  const { type, setType, start, setStart, end, setEnd, setLoading, setItems } = useMainContext();
  const refs = {
    type: useRef<HTMLSelectElement>(null),
    start: useRef<HTMLInputElement>(null),
    end: useRef<HTMLInputElement>(null),
    query: useRef<HTMLButtonElement>(null),
    reset: useRef<HTMLButtonElement>(null),
  };
  const onChanges = {
    type: (event: ChangeEvent<HTMLSelectElement>) => {
      switch (refs.type.current?.value) {
        case '1':
        case '2':
        case '3':
          setType(refs.type.current.value);
          localStorage.setItem('type', refs.type.current.value);
          return;
      }
    },
    start: (event: ChangeEvent<HTMLInputElement>) => {
      setStart(dayjs(refs.start.current?.value));
      localStorage.setItem('start', `${refs.start.current?.value}`);
    },
    end: (event: ChangeEvent<HTMLInputElement>) => {
      setEnd(dayjs(refs.end.current?.value));
      localStorage.setItem('end', `${refs.end.current?.value}`);
    },
  };
  const query = useCallback(async () => {
    localStorage.setItem('type', type);
    localStorage.setItem('start', start.format('YYYY-MM'));
    localStorage.setItem('end', end.format('YYYY-MM'));
    const [SYY, SMM]: string[] = start.format('YYYY-MM').split('-');
    const [EYY, EMM]: string[] = end.format('YYYY-MM').split('-');
    setLoading(true);
    try {
      setItems(await getMusicList({ strType: type, SYY, SMM, EYY, EMM }));
    } catch (error) {
      // API error
    }
    setLoading(false);
  }, [end, setItems, setLoading, start, type]);
  const onClicks = {
    query: async (event: React.MouseEvent<HTMLButtonElement>) => {
      await query();
    },
    reset: (event: React.MouseEvent<HTMLButtonElement>) => {
      setType(defaultValues.type);
      setStart(defaultValues.start);
      setEnd(defaultValues.end);
      localStorage.setItem('type', defaultValues.type);
      localStorage.setItem('start', defaultValues.start.format('YYYY-MM'));
      localStorage.setItem('end', defaultValues.end.format('YYYY-MM'));
    },
  };
  useEffect(() => {
    query();
  }, [query]);
  const today = useMemo(() => dayjs(), []);
  return (
    <div className="controls">
      <div className="row">
        <select id="type" ref={refs.type} value={type} onChange={onChanges.type}>
          <option value="1">가요</option>
          <option value="2">POP</option>
          <option value="3">JPOP</option>
        </select>
        <input id="start" ref={refs.start} type="month" value={start.format('YYYY-MM')} max={today.format('YYYY-MM')} onChange={onChanges.start} />
        <input id="end" ref={refs.end} type="month" value={end.format('YYYY-MM')} max={today.format('YYYY-MM')} onChange={onChanges.end} />
      </div>
      <div className="row">
        <button id="query" onClick={_.throttle(onClicks.query, 1000)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 조회
        </button>
        <button id="reset" onClick={onClicks.reset}>
          <FontAwesomeIcon icon={faTrash} /> 초기화
        </button>
      </div>
    </div>
  );
};
