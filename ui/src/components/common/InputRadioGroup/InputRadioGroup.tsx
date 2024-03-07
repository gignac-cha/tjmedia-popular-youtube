import {
  Children,
  ComponentProps,
  InputHTMLAttributes,
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  ReactPortal,
  cloneElement,
  useMemo,
} from 'react';

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
  name,
  value,
  defaultChecked,
  onChange,
}: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
  return (
    <Label>
      <InputRadio
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      {children}
    </Label>
  );
};

const isReactElement = <T,>(
  element:
    | string
    | number
    | ReactElement<T, string | JSXElementConstructor<T>>
    | Iterable<ReactNode>
    | ReactPortal,
): element is ReactElement<T> =>
  typeof element === 'object' && 'props' in element;

export const InputRadioGroup = Object.assign(
  ({
    children,
    name,
    defaultValue,
    onChange,
  }: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
    const newChildren = useMemo(
      () =>
        Children.toArray(children).map((child) => {
          if (!isReactElement<ComponentProps<typeof Option>>(child)) {
            return child;
          }
          return cloneElement(child, {
            name,
            defaultChecked: child.props.value === defaultValue,
            onChange,
          });
        }),
      [children, defaultValue, name, onChange],
    );
    return <section>{newChildren}</section>;
  },
  { Option },
);
