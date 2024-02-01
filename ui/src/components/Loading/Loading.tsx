import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Loading = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <>
      {isLoading && (
        <section className="loading">
          {isLoading && (
            <FontAwesomeIcon icon={faRotateRight} size={'2x'} spin={true} />
          )}
        </section>
      )}
    </>
  );
};
