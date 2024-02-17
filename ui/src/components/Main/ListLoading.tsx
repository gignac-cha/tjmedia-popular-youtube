import { Loading } from '../Loading/Loading';
import { styles } from './styles';

export const ListLoading = () => {
  return (
    <section css={styles.list.loading}>
      <Loading />
    </section>
  );
};
