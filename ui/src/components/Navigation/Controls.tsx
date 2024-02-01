/* eslint-disable @typescript-eslint/no-unused-vars */
import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { defaultValue, useQueryContext } from '../../contexts/QueryContext';
import { getMusicList } from '../../utilities/tjmedia';

export const Controls = () => {
  const { type, setType, start, setStart, end, setEnd, setLoading, setItems } =
    useQueryContext();

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
      setType(defaultValue.type);
      setStart(defaultValue.start);
      setEnd(defaultValue.end);
      localStorage.setItem('type', defaultValue.type);
      localStorage.setItem('start', defaultValue.start.format('YYYY-MM'));
      localStorage.setItem('end', defaultValue.end.format('YYYY-MM'));
    },
  };

  useEffect(() => {
    query();
  }, [query]);

  const today = useMemo(() => dayjs(), []);

  return (
    <section className="controls">
      <section className="row">
        <select
          id="type"
          ref={refs.type}
          value={type}
          onChange={onChanges.type}
        >
          <option value="1">가요</option>
          <option value="2">POP</option>
          <option value="3">JPOP</option>
        </select>
        <input
          id="start"
          ref={refs.start}
          type="month"
          value={start.format('YYYY-MM')}
          max={today.format('YYYY-MM')}
          onChange={onChanges.start}
        />
        <input
          id="end"
          ref={refs.end}
          type="month"
          value={end.format('YYYY-MM')}
          max={today.format('YYYY-MM')}
          onChange={onChanges.end}
        />
      </section>
      <section className="row">
        <button id="query" onClick={_.throttle(onClicks.query, 1000)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 조회
        </button>
        <button id="reset" onClick={onClicks.reset}>
          <FontAwesomeIcon icon={faTrash} /> 초기화
        </button>
      </section>
    </section>
  );
};
