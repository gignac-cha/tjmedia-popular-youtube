import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useVideoContext } from '../../contexts/VideoContext';
import { Button } from '../common/Button/Button';
import { styles } from './styles';

export const VideoControls = () => {
  const { cachedItems, selectedIndex, previousItem, nextItem } =
    useVideoContext();

  return (
    <section css={styles.video.controlsContainer}>
      <Button
        onClick={previousItem}
        title="이전 영상"
        disabled={!(selectedIndex > 0)}
      >
        <FontAwesomeIcon icon={faBackward} /> 이전
      </Button>
      {cachedItems.length > 0 && (
        <b
          title={`총 ${cachedItems.length}개의 영상 중 ${selectedIndex + 1}번째`}
        >
          {selectedIndex + 1} / {cachedItems.length}
        </b>
      )}
      <Button
        onClick={nextItem}
        title="다음 영상"
        disabled={!(selectedIndex < cachedItems.length - 1)}
      >
        <FontAwesomeIcon icon={faForward} /> 다음
      </Button>
    </section>
  );
};
