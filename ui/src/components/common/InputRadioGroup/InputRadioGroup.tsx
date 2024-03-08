import {
  InputHTMLAttributes,
  PropsWithChildren,
  createContext,
  useContext,
} from 'react';

const defaultValue: InputHTMLAttributes<HTMLInputElement> = {};

const InputRadioContext = createContext<typeof defaultValue>(defaultValue);

const Label = ({ children }: PropsWithChildren) => {
  return <label>{children}</label>;
};

const InputRadio = ({
  name,
  value,
  defaultChecked,
  onChange,
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
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
  const { name, defaultValue, onChange } = useContext(InputRadioContext);

  return (
    <Label>
      <InputRadio
        name={name}
        value={value}
        defaultChecked={value === defaultValue}
        onChange={onChange}
      />
      {children}
    </Label>
  );
};

export const InputRadioGroup = Object.assign(
  ({
    children,
    name,
    defaultValue,
    onChange,
  }: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
    return (
      <InputRadioContext.Provider value={{ name, defaultValue, onChange }}>
        <section>{children}</section>
      </InputRadioContext.Provider>
    );
  },
  { Option },
);
