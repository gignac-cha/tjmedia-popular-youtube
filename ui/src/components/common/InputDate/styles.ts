import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    ${commonStyles.focusableControl}
    label: common-date-container;

    box-sizing: border-box;
    width: 100%;
  `,
};
