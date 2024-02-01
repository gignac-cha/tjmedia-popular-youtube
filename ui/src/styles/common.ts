import { css } from '@emotion/react';

const control = css`
  padding: 1rem;
  border: none;
  outline: 1px solid gray;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  transition: width 0.2s, background-color 0.2s, outline 0.2s;

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

  selectContainer: css`
    label: common-select-container;

    display: flex;
    padding-right: 1rem;
    outline: 1px solid gray;
    border-radius: 4px;
    transition: width 0.2s, background-color 0.2s, outline 0.2s;

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
    ${control}
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
  date: css`
    ${control}
    label: common-date;
  `,
  button: css`
    ${control}
    label: common-button;

    background-color: #eee;

    &:hover {
      background-color: #ddd;
    }
    &:active {
      background-color: #ccc;
    }
  `,
  emptyButton: css`
    ${control}
    label: common-empty-button;

    background: none;
    border: none;
    border-radius: 0;
    outline: none;

    &:hover {
      background: none;
      border: none;
      outline: none;
    }
    &:active {
      background: none;
      border: none;
      outline: none;
    }
    &:focus {
      background: none;
      border: none;
      outline: none;
    }
  `,

  ellipsis: css`
    label: common-ellipsis;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `,
};
