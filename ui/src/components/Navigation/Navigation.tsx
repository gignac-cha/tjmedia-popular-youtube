import { PropsWithChildren } from 'react';
import { styles } from './styles';

export const Navigation = ({ children }: PropsWithChildren) => {
  return <nav css={styles.container}>{children}</nav>;
};
