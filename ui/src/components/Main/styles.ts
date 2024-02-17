import { css } from '@emotion/react';
import { commonStyles } from '../../styles/common';

export const styles = {
  container: css`
    label: main-container;

    @media screen and (max-width: 40rem) {
      padding: 0 1rem;
    }
  `,

  list: {
    container: css`
      ${commonStyles.row}
      label: list-container;

      position: relative;
      min-height: 10rem;
      outline: 1px solid black;
      border-radius: 4px;
    `,
    innerContainer: css`
      label: list-inner-container;

      list-style: none;
      margin: 0;
      padding: 0;
      filter: blur(0rem);
      transition: filter 0.2s;
    `,
    loadingContainer: css`
      label: list-loading-container;

      filter: blur(1rem);
    `,

    loading: css`
      ${commonStyles.row}
      label: list-loading;

      position: absolute;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    `,
  },

  emptyListContainer: css`
    label: empty-list-container;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    max-height: 4rem;
  `,

  item: {
    container: css`
      ${commonStyles.row}
      label: item-container;

      position: relative;
      padding: 1rem;
      max-height: 4rem;
      transition:
        background-color 0.2s,
        border-color 0.2s,
        transform 0.2s;

      &:not(:last-child) {
        border-bottom: 1px solid black;
      }

      &:hover {
        background-color: #333;
        color: white;
        transform: scale(1.05);

        &:not(:last-child) {
          border-bottom: 1px solid #333;
        }
      }
    `,
    loadingContainer: css`
      label: item-loading-container;

      filter: blur(1rem);
    `,
    expandedContainer: css`
      label: item-expanded-container;

      row-gap: 1rem;
      max-height: 100rem;
    `,

    expandButton: css`
      ${commonStyles.emptyButton}
      ${commonStyles.column}
      label: item-expand-button;

      justify-content: space-between;
      align-items: stretch;
      column-gap: 1rem;
      padding: 0;
      color: inherit;
      letter-spacing: -0.1rem;
      transition: color 0.2s;
    `,
    leftContainer: css`
      ${commonStyles.column}
      label: item-left-container;

      flex-grow: 1;
      column-gap: 1rem;
      align-items: flex-start;
      overflow: hidden;
    `,
    rightContainer: css`
      ${commonStyles.column}
      label: item-end-container;

      align-items: flex-end;
    `,
    title: css`
      ${commonStyles.ellipsis}
      label: item-title;

      flex-grow: 1;
      margin: 0;
      text-align: initial;

      @media screen and (max-width: 40rem) {
        font-size: 1rem;
      }
      @media screen and (min-width: 40rem) and (max-width: 60rem) {
        font-size: 2rem;
      }
      @media screen and (min-width: 60rem) {
        font-size: 2rem;
      }
    `,
    artist: css`
      ${commonStyles.ellipsis}
      label: item-artist;

      @media screen and (max-width: 40rem) {
        font-size: 0.5rem;
      }
      @media screen and (min-width: 40rem) and (max-width: 60rem) {
        font-size: 1rem;
      }
      @media screen and (min-width: 60rem) {
        font-size: 1rem;
      }
    `,

    middleContainer: css`
      ${commonStyles.row}
      label: item-middle-container;

      justify-content: center;
      align-items: center;
      height: 0;
    `,
    showMiddleContainer: css`
      label: item-show-middle-container;

      height: fit-content;
    `,
    video: css`
      label: item-video;

      display: none;
      border: none;
      outline: none;
      filter: blur(0rem);
      transition:
        width 0.2s,
        height 0.2s,
        filter 0.2s;
    `,
    showVideo: css`
      label: item-show-video;

      display: inherit;
    `,
    loadingVideo: css`
      label: item-loading-video;

      filter: blur(1rem);
    `,

    bottomContainer: css`
      ${commonStyles.column}
      label: item-bottom-container;

      justify-content: space-between;
      align-items: center;
      display: none;
    `,
    showBottomContainer: css`
      label: item-show-bottom-container;

      display: inherit;
    `,
  },
};
