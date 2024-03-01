import { css } from '@emotion/react';
import { commonStyles } from '../../../styles/common';

export const styles = {
  container: css`
    label: common-select-container;

    display: inline-flex;
    padding-right: 1rem;
    outline: 1px solid gray;
    border-radius: 4px;
    transition:
      width 0.2s,
      background-color 0.2s,
      outline 0.2s;

    &:hover {
      background-color: #eee;
    }
    &:active {
      background-color: #ddd;
    }
    &:focus-within {
      outline: 2px solid black;
    }
  `,
  select: css`
    ${commonStyles.control}
    label: common-select;

    flex-grow: 1;
    background: none;
    outline: none;

    &:hover {
      background: none;
    }
    &:active {
      background: none;
    }
    &:focus {
      outline: none;
    }
  `,
};
