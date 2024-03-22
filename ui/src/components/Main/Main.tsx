import { PropsWithChildren } from 'react';
import { styles } from './styles';

export const Main = ({ children }: PropsWithChildren) => {
  return <main css={styles.container}>{children}</main>;
};
