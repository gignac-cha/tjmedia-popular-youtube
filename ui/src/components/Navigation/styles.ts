import { css } from '@emotion/react';
import { commonStyles } from '../../styles/common';

export const styles = {
  container: css`
    label: navigation-container;

    @media screen and (max-width: 40rem) {
      padding: 0 1rem;
    }
  `,

  controls: {
    container: css`
      ${commonStyles.row}
      label: controls-container;

      row-gap: 1rem;
    `,
    queryContainer: css`
      ${commonStyles.grid}
      label: controls-query-container;

      grid-template-columns: 1fr 1fr;
      column-gap: 1rem;
    `,
    buttonContainer: css`
      ${commonStyles.grid}
      label: controls-button-container;

      grid-template-columns: 1fr 1fr;
      column-gap: 1rem;
    `,
  },
};
