/* eslint-disable @typescript-eslint/no-unused-vars */
import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { defaultValue, useQueryContext } from '../../contexts/QueryContext';
import { commonStyles } from '../../styles/common';
import { getMusicList } from '../../utilities/tjmedia';
import { styles } from './styles';

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
    <section css={styles.controls.container}>
      <section css={styles.controls.queryContainer}>
        <section
          css={[commonStyles.selectContainer, styles.controls.selectContainer]}
          title="가요 / POP / JPOP 선택"
        >
          <select
            css={commonStyles.select}
            ref={refs.type}
            value={type}
            onChange={onChanges.type}
          >
            <option value="1">가요</option>
            <option value="2">POP</option>
            <option value="3">JPOP</option>
          </select>
        </section>
        <input
          css={[commonStyles.date, styles.controls.date]}
          ref={refs.start}
          type="month"
          value={start.format('YYYY-MM')}
          max={today.format('YYYY-MM')}
          title="검색 범위 처음"
          onChange={onChanges.start}
        />
        <input
          css={[commonStyles.date, styles.controls.date]}
          ref={refs.end}
          type="month"
          value={end.format('YYYY-MM')}
          max={today.format('YYYY-MM')}
          title="검색 범위 끝"
          onChange={onChanges.end}
        />
      </section>
      <section css={styles.controls.buttonContainer}>
        <button
          css={[commonStyles.button, styles.controls.button]}
          title="인기곡 조회"
          onClick={_.throttle(onClicks.query, 1000)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 조회
        </button>
        <button
          css={[commonStyles.button, styles.controls.button]}
          title="검색 조건 초기화"
          onClick={onClicks.reset}
        >
          <FontAwesomeIcon icon={faTrash} /> 초기화
        </button>
      </section>
    </section>
  );
};
