import { css } from '@emotion/react';

const control = css`
  padding: 1rem;
  border: none;
  outline: 1px solid gray;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  transition:
    width 0.2s,
    background-color 0.2s,
    outline 0.2s;
`;
const focusableControl = css`
  ${control}

  &:hover {
    background-color: #eee;
  }
  &:active {
    background-color: #ddd;
  }
  &:focus {
    outline: 2px solid black;
  }
`;

export const commonStyles = {
  row: css`
    label: common-row;

    display: flex;
    flex-direction: column;
  `,
  column: css`
    label: common-column;

    display: flex;
    flex-direction: row;
  `,

  control,
  focusableControl,
  ellipsis: css`
    label: common-ellipsis;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `,
};
