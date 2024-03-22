import {
  InputHTMLAttributes,
  PropsWithChildren,
  createContext,
  useContext,
} from 'react';
import { styles } from './styles';

const defaultContextValue: InputHTMLAttributes<HTMLInputElement> & {
  position?: 'left' | 'right';
} = {
  position: 'right',
};

const InputRadioContext =
  createContext<typeof defaultContextValue>(defaultContextValue);

const Label = ({ children }: PropsWithChildren) => {
  return <label css={styles.option.label}>{children}</label>;
};

const InputRadio = ({
  name,
  value,
  defaultChecked,
  onChange,
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      css={styles.option.input}
      type="radio"
      name={name}
      value={value}
      defaultChecked={defaultChecked}
      onChange={onChange}
    />
  );
};

const Option = ({
  children,
  value,
}: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
  const { name, defaultValue, onChange, position } =
    useContext(InputRadioContext);

  return (
    <Label>
      {position === 'left' && children}
      <InputRadio
        name={name}
        value={value}
        defaultChecked={value === defaultValue}
        onChange={onChange}
      />
      {position === 'right' && children}
    </Label>
  );
};

export const InputRadioGroup = Object.assign(
  ({
    children,
    name,
    defaultValue,
    onChange,
    position = defaultContextValue.position,
  }: PropsWithChildren<typeof defaultContextValue>) => {
    return (
      <InputRadioContext.Provider
        value={{ name, defaultValue, onChange, position }}
      >
        <section css={styles.container}>{children}</section>
      </InputRadioContext.Provider>
    );
  },
  { Option },
);
