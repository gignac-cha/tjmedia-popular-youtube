import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    ${commonStyles.control}
    label: common-button-container;

    background-color: #eee;

    &:hover {
      background-color: #ddd;
    }
    &:active {
      background-color: #ccc;
    }
  `,
};
