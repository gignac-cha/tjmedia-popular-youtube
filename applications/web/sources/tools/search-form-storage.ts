import type { SearchForm } from '../types/tjmedia.ts';
import { buildThisMonthDateRange } from './dates.ts';

const STORAGE_KEY = 'tjmedia-search-form';

export function buildDefaultSearchForm(): SearchForm {
  return {
    chartType: 'TOP',
    ...buildThisMonthDateRange(),
    strType: '1',
  };
}

export function loadSearchForm(): SearchForm {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      return JSON.parse(stored) as SearchForm;
    }
  } catch {
    // ignore
  }

  return buildDefaultSearchForm();
}

export function saveSearchForm(searchForm: SearchForm): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchForm));
  } catch {
    // ignore
  }
}

export function clearSearchForm(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isDefaultDateRange(searchForm: SearchForm): boolean {
  const defaultSearchForm = buildDefaultSearchForm();

  return (
    searchForm.searchStartDate === defaultSearchForm.searchStartDate &&
    searchForm.searchEndDate === defaultSearchForm.searchEndDate
  );
}
