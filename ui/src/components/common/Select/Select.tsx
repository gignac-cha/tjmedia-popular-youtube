import {
  OptionHTMLAttributes,
  PropsWithChildren,
  SelectHTMLAttributes,
} from 'react';
import { styles } from './styles';

const Option = ({
  children,
  value,
}: PropsWithChildren<OptionHTMLAttributes<HTMLOptionElement>>) => {
  return <option {...{ value }}>{children}</option>;
};

export const Select = Object.assign(
  ({
    children,
    className,
    title,
    defaultValue,
    onChange,
  }: PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement>>) => {
    return (
      <section css={styles.container} {...{ className, title }}>
        <select css={styles.select} {...{ defaultValue, onChange }}>
          {children}
        </select>
      </section>
    );
  },
  { Option },
);
