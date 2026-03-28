import styled from '@emotion/styled';

export const StyledHeader = styled.header`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 45;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
  }
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
`;

export const MobileFilterToggle = styled.button`
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

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const DesktopControls = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: contents;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
  }
`;

export const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const CustomDateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-tertiary);
  padding: 0.25rem;
  border-radius: 8px;
`;

export const Input = styled.input`
  padding: 0.4rem 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  color-scheme: dark;

  &:focus {
    border-color: var(--accent-color);
  }
`;

export const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--error-color);
    border-color: var(--error-color);
    background-color: rgba(239, 68, 68, 0.1);
  }
`;
