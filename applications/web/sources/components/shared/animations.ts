import { keyframes } from '@emotion/react';

export const equalizerAnimation = keyframes`
  0% { height: 4px; }
  50% { height: 16px; }
  100% { height: 4px; }
`;

export const shimmerAnimation = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;
