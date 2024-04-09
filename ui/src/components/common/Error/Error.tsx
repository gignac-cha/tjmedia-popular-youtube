import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styles } from './styles';

export const Error = () => {
  return (
    <section css={styles.container}>
      <FontAwesomeIcon icon={faCircleXmark} color="red" /> 서비스 오류
    </section>
  );
};
