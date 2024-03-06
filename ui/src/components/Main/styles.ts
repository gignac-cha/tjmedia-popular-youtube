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
      label: item-container;

      transition: border-color 0.2s;

      &:not(:last-child) {
        border-bottom: 1px solid black;
      }

      &:hover {
        &:not(:last-child) {
          border-color: transparent;
        }
      }
    `,

    expandable: {
      container: css`
        ${commonStyles.row}
        label: item-expandable-container;

        position: relative;
        overflow: hidden;
        transition:
          height 0.2s,
          background-color 0.2s,
          transform 0.2s;

        &:hover {
          background-color: #333;
          color: white;
          transform: scale(1.05);
        }
      `,
      expanded: css`
        label: item-expanded-container;

        row-gap: 1rem;
        overflow: initial;
      `,
    },

    topContainer: css`
      label: item-expandable-container;

      list-style: none;
      justify-content: space-between;
      align-items: stretch;
      column-gap: 1rem;
      padding: 1rem;
      color: inherit;
      cursor: pointer;
      transition: color 0.2s;

      @media screen and (max-width: 40rem) {
        ${commonStyles.row}
      }
      @media screen and (min-width: 40rem) {
        ${commonStyles.column}
      }
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

      @media screen and (max-width: 40rem) {
        justify-content: flex-end;
      }
      @media screen and (min-width: 40rem) {
        align-items: flex-end;
      }
    `,
    title: css`
      ${commonStyles.ellipsis}
      label: item-title;

      flex-grow: 1;
      margin: 0;
      text-align: initial;
      transition:
        font-size 0.2s,
        letter-spacing 0.2s;

      @media screen and (max-width: 40rem) {
        font-size: 2rem;
        line-height: 2rem;
        letter-spacing: -0.2rem;
      }
      @media screen and (min-width: 40rem) and (max-width: 60rem) {
        ${commonStyles.ellipsis}
        font-size: 1.75rem;
      }
      @media screen and (min-width: 60rem) {
        ${commonStyles.ellipsis}
        font-size: 2rem;
      }
    `,
    artist: css`
      ${commonStyles.ellipsis}
      label: item-artist;

      transition:
        font-size 0.2s,
        letter-spacing 0.2s;

      @media screen and (max-width: 40rem) {
        font-size: 1.5rem;
        letter-spacing: -0.1rem;
      }
      @media screen and (min-width: 40rem) {
        font-size: 1rem;
      }
    `,
  },

  video: {
    container: css`
      ${commonStyles.row}
      label: video-container;

      height: 0;
    `,
    showContainer: css`
      label: video-show-container;

      height: fit-content;
    `,

    frame: {
      container: css`
        ${commonStyles.row}
        label: video-frame-container;

        justify-content: center;
        align-items: center;
      `,
      iframe: css`
        label: video-frame-iframe;

        max-width: 100%;
        border: none;
        outline: none;
        filter: blur(0rem);
        transition:
          width 0.2s,
          height 0.2s,
          filter 0.2s,
          transform 0.2s;
      `,
      loadingIframe: css`
        label: video-frame-loading-iframe;

        filter: blur(1rem);
        transform: scale(0.9);
      `,
    },

    controlsContainer: css`
      ${commonStyles.column}
      label: video-controls-container;

      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    `,
  },
};
