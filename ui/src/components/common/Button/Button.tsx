import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { styles } from './styles';

export const Button = ({
  children,
  className,
  title,
  onClick,
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button css={styles.container} {...{ className, title, onClick }}>
      {children}
    </button>
  );
};
