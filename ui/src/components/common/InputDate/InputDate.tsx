import { Dayjs } from 'dayjs';
import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import { styles } from './styles';

type InputDateType = Extract<HTMLInputTypeAttribute, 'month' | 'week' | 'date'>;

const convertDayjsByType = (type: InputDateType, value: Dayjs) => {
  switch (type) {
    case 'month':
      return value.format('YYYY-MM');
    case 'week':
      return value.format('YYYY-WMM');
    case 'date':
      return value.format('YYYY-MM-DD');
  }
};

export const InputDate = ({
  className,
  type = 'date',
  value: rawValue,
  max: rawMax,
  title,
  onChange,
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'max'> & {
  type: InputDateType;
} & (
    | { value?: InputHTMLAttributes<HTMLInputElement>['value'] }
    | { value?: Dayjs }
  ) &
  (
    | { max?: InputHTMLAttributes<HTMLInputElement>['max'] }
    | { max?: Dayjs }
  )) => {
  const value =
    typeof rawValue === 'object' && 'format' in rawValue
      ? convertDayjsByType(type, rawValue)
      : rawValue;
  const max =
    typeof rawMax === 'object' && 'format' in rawMax
      ? convertDayjsByType(type, rawMax)
      : rawMax;
  return (
    <input
      css={styles.container}
      {...{ className, type, value, max, title, onChange }}
    />
  );
};
