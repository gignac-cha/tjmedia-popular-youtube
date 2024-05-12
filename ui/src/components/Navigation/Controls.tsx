import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { useQueryContext } from '../../contexts/QueryContext';
import { Button } from '../common/Button/Button';
import { InputDate } from '../common/InputDate/InputDate';
import { InputRadioGroup } from '../common/InputRadioGroup/InputRadioGroup';
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
      (event: ChangeEvent<HTMLInputElement>) => {
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

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [
        'tjmedia-music-list',
        query.strType,
        query.SYY,
        query.SMM,
        query.EYY,
        query.EMM,
      ],
    });
  }, [query.EMM, query.EYY, query.SMM, query.SYY, query.strType, queryClient]);

  const onClicks = {
    query: useCallback(() => refresh(), [refresh]),
    reset: useCallback(() => {
      resetQuery();
      refresh();
    }, [refresh, resetQuery]),
  };

  const today = useMemo(() => dayjs(), []);

  return (
    <section css={styles.controls.container}>
      <InputRadioGroup
        name="type"
        defaultValue={type}
        onChange={onChanges.type}
      >
        <InputRadioGroup.Option value={'1'}>🇰🇷 가요</InputRadioGroup.Option>
        <InputRadioGroup.Option value={'2'}>🇺🇸 POP</InputRadioGroup.Option>
        <InputRadioGroup.Option value={'3'}>🇯🇵 JPOP</InputRadioGroup.Option>
      </InputRadioGroup>
      <section css={styles.controls.queryContainer}>
        <InputDate
          type="month"
          defaultValue={start}
          max={today}
          title="검색 범위 처음"
          onChange={onChanges.start}
        />
        <InputDate
          type="month"
          defaultValue={end}
          max={today}
          title="검색 범위 끝"
          onChange={onChanges.end}
        />
      </section>
      <section css={styles.controls.buttonContainer}>
        <Button title="인기곡 조회" onClick={_.throttle(onClicks.query, 1000)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 조회
        </Button>
        <Button title="검색 조건 초기화" onClick={onClicks.reset}>
          <FontAwesomeIcon icon={faTrash} /> 초기화
        </Button>
      </section>
    </section>
  );
};
