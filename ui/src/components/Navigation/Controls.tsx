import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { useQueryContext } from '../../contexts/QueryContext';
import { commonStyles } from '../../styles/common';
import { styles } from './styles';

export const Controls = () => {
  const {
    type,
    changeType,
    start,
    changeStart,
    end,
    changeEnd,
    resetQuery,
    query,
  } = useQueryContext();

  const onChanges = {
    type: useCallback(
      (event: ChangeEvent<HTMLSelectElement>) => {
        switch (event.currentTarget.value) {
          case '1':
          case '2':
          case '3':
            changeType(event.currentTarget.value);
            return;
        }
      },
      [changeType],
    ),
    start: useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        changeStart(dayjs(event.currentTarget.value));
      },
      [changeStart],
    ),
    end: useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        changeEnd(dayjs(event.currentTarget.value));
      },
      [changeEnd],
    ),
  };

  const queryClient = useQueryClient();

  const onClicks = {
    query: useCallback(
      () =>
        queryClient.invalidateQueries({
          queryKey: [
            'tjmedia-music-list',
            query.strType,
            query.SYY,
            query.SMM,
            query.EYY,
            query.EMM,
          ],
        }),
      [query.EMM, query.EYY, query.SMM, query.SYY, query.strType, queryClient],
    ),
    reset: useCallback(() => resetQuery(), [resetQuery]),
  };

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
          type="month"
          value={start.format('YYYY-MM')}
          max={today.format('YYYY-MM')}
          title="검색 범위 처음"
          onChange={onChanges.start}
        />
        <input
          css={[commonStyles.date, styles.controls.date]}
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
