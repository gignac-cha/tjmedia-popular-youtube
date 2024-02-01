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
      ${commonStyles.column}
      label: controls-query-container;

      column-gap: 1rem;
    `,
    buttonContainer: css`
      ${commonStyles.column}
      label: controls-button-container;

      column-gap: 1rem;
    `,

    selectContainer: css`
      label: controls-select-container;

      flex-grow: 1;
    `,
    date: css`
      label: controls-date;

      flex-grow: 1;
    `,
    button: css`
      label: controls-button;

      flex-grow: 1;
    `,
  },
};
