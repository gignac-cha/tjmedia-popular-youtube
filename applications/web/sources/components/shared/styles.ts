import styled from '@emotion/styled';
import { shimmerAnimation } from './animations.ts';

export const SegmentedControl = styled.div`
  display: flex;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
`;

export const SegmentButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: ${({ isActive }) =>
    isActive ? 'var(--bg-secondary)' : 'transparent'};
  color: ${({ isActive }) =>
    isActive ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-weight: ${({ isActive }) => (isActive ? '600' : '500')};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ isActive }) =>
    isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'};

  &:hover:not(:disabled) {
    color: var(--text-primary);
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;

  svg {
    font-size: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }
`;

export const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
  margin: 1.5rem;
  border-radius: 0 8px 8px 0;
  font-size: 0.875rem;
`;

export const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--border-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 1000px 100%;
  animation: ${shimmerAnimation} 2s infinite linear;
  border-radius: 4px;
`;

export const Subtitle = styled.span`
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
