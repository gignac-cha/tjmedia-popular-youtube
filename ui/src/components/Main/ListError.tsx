import { Error } from '../common/Error/Error';
import { styles } from './styles';

export const ListError = () => {
  return (
    <section css={styles.list.error}>
      <Error />
    </section>
  );
};
