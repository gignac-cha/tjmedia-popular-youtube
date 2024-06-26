import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    ${commonStyles.grid}
    ${commonStyles.control}
    label: common-input-radio-group-container;

    grid-template-columns: 1fr 1fr 1fr;
    padding: initial;
    overflow: hidden;
  `,
  option: {
    label: css`
      ${commonStyles.focusableControl}
      ${commonStyles.column}
      label: common-input-radio-group-option-label;

      flex-grow: 1;
      justify-content: center;
      align-items: center;
      background-color: white;
      outline: initial;
      border-radius: initial;

      &:has(input[type='radio']:focus) {
        outline: initial;
      }
      &:has(input[type='radio']:active) {
        outline: initial;
      }

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
