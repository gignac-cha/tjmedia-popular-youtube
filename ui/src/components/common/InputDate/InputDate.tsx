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
  defaultValue: rawDefaultValue,
  max: rawMax,
  title,
  onChange,
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'max'> & {
  type: InputDateType;
} & (
    | { defaultValue?: InputHTMLAttributes<HTMLInputElement>['defaultValue'] }
    | { defaultValue?: Dayjs }
  ) &
  (
    | { max?: InputHTMLAttributes<HTMLInputElement>['max'] }
    | { max?: Dayjs }
  )) => {
  const defaultValue =
    typeof rawDefaultValue === 'object' && 'format' in rawDefaultValue
      ? convertDayjsByType(type, rawDefaultValue)
      : `${rawDefaultValue}`;
  const max =
    typeof rawMax === 'object' && 'format' in rawMax
      ? convertDayjsByType(type, rawMax)
      : rawMax;
  return (
    <section>
      <input
        ref={(ref: HTMLInputElement) => ref && (ref.value = defaultValue)}
        css={styles.container}
        {...{ className, type, defaultValue, max, title, onChange }}
      />
    </section>
  );
};
