import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useVideoContext } from '../../contexts/VideoContext';
import { commonStyles } from '../../styles/common';
import { styles } from './styles';

export const VideoControls = () => {
  const { cachedItems, selectedIndex, previousItem, nextItem } =
    useVideoContext();

  return (
    <section css={styles.item.bottomContainer}>
      <button
        css={commonStyles.button}
        onClick={previousItem}
        disabled={selectedIndex === 0}
        title="이전 영상"
      >
        <FontAwesomeIcon icon={faBackward} /> 이전
      </button>
      {cachedItems.length > 0 && (
        <b
          title={`총 ${cachedItems.length}개의 영상 중 ${selectedIndex + 1}번째`}
        >
          {selectedIndex + 1} / {cachedItems.length}
        </b>
      )}
      <button
        css={commonStyles.button}
        onClick={nextItem}
        disabled={selectedIndex === cachedItems.length - 1}
        title="다음 영상"
      >
        <FontAwesomeIcon icon={faForward} /> 다음
      </button>
    </section>
  );
};
