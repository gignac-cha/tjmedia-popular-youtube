import { FunctionComponent } from 'react';

import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface LoadingProperties {
  isLoading: boolean;
}

export const Loading: FunctionComponent<LoadingProperties> = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <div className="loading">{isLoading && <FontAwesomeIcon icon={faRotateRight} size={'2x'} spin={true} />}</div>
      )}
    </>
  );
};
