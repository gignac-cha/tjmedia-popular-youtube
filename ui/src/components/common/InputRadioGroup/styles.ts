import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    ${commonStyles.column}
    label: common-input-radio-group-container;

    justify-content: space-between;
    padding: initial;
  `,
  option: {
    label: css`
      ${commonStyles.column}
      label: common-input-radio-group-option-label;

      flex-grow: 1;
      justify-content: center;
      align-items: center;
      background-color: white;
      outline: initial;
      border-radius: initial;

      &:has(input[type='radio']:checked) {
        background-color: #333;
        color: white;
      }
    `,
    input: css`
      label: common-input-radio-group-option-input;

      display: none;
    `,
  },
};
