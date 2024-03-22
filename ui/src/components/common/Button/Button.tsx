import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { styles } from './styles';

export const Button = ({
  children,
  className,
  title,
  disabled,
  onClick,
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button css={styles.container} {...{ className, title, disabled, onClick }}>
      {children}
    </button>
  );
};
