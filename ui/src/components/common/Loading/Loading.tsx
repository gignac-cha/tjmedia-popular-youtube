import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styles } from './styles';

export const Loading = () => {
  return (
    <section css={styles.container}>
      <FontAwesomeIcon icon={faRotateRight} size={'2x'} spin={true} />
    </section>
  );
};
