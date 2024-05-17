import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    ${commonStyles.column}
    label: common-loading-container;

    justify-content: center;
    align-items: center;
    column-gap: 0.5rem;
    padding: 1rem;
    background-color: #fbb;
    border-radius: 4px;
    color: black;
  `,
};
