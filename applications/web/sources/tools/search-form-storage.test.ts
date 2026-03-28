import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  buildDefaultSearchForm,
  isDefaultDateRange,
  loadSearchForm,
  saveSearchForm,
  clearSearchForm,
} from './search-form-storage.ts';
import type { SearchForm } from '../types/tjmedia.ts';

function createMockLocalStorage(): Storage {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => {
      return [...store.keys()][index] ?? null;
    }),
  };
}

describe('search-form-storage', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
  });

  describe('buildDefaultSearchForm', () => {
    it('returns a SearchForm with chartType TOP and strType 1', () => {
      const form = buildDefaultSearchForm();

      expect(form.chartType).toBe('TOP');
      expect(form.strType).toBe('1');
    });

    it('returns searchStartDate as the first day of this month', () => {
      const form = buildDefaultSearchForm();
      const now = new Date();
      const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      expect(form.searchStartDate).toBe(expectedStart);
    });

    it('returns searchEndDate as today', () => {
      const form = buildDefaultSearchForm();
      const expectedEnd = new Date().toISOString().slice(0, 10);

      expect(form.searchEndDate).toBe(expectedEnd);
    });
  });

  describe('isDefaultDateRange', () => {
    it('returns true when dates match this month range', () => {
      const form = buildDefaultSearchForm();

      expect(isDefaultDateRange(form)).toBe(true);
    });

    it('returns true regardless of chartType and strType when dates match', () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const endDate = now.toISOString().slice(0, 10);

      const form: SearchForm = {
        chartType: 'HOT',
        strType: '2',
        searchStartDate: startDate,
        searchEndDate: endDate,
      };

      expect(isDefaultDateRange(form)).toBe(true);
    });

    it('returns false when searchStartDate differs', () => {
      const form: SearchForm = {
        chartType: 'TOP',
        strType: '1',
        searchStartDate: '2020-01-01',
        searchEndDate: new Date().toISOString().slice(0, 10),
      };

      expect(isDefaultDateRange(form)).toBe(false);
    });

    it('returns false when searchEndDate differs', () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      const form: SearchForm = {
        chartType: 'TOP',
        strType: '1',
        searchStartDate: startDate,
        searchEndDate: '2020-12-31',
      };

      expect(isDefaultDateRange(form)).toBe(false);
    });
  });

  describe('loadSearchForm', () => {
    it('returns default search form when localStorage is empty', () => {
      const form = loadSearchForm();
      const defaultForm = buildDefaultSearchForm();

      expect(form).toEqual(defaultForm);
    });

    it('returns parsed search form from localStorage', () => {
      const stored: SearchForm = {
        chartType: 'HOT',
        strType: '3',
        searchStartDate: '2025-06-01',
        searchEndDate: '2025-06-15',
      };
      localStorage.setItem('tjmedia-search-form', JSON.stringify(stored));

      const form = loadSearchForm();

      expect(form).toEqual(stored);
    });

    it('returns default search form when localStorage contains invalid JSON', () => {
      localStorage.setItem('tjmedia-search-form', 'not-valid-json');

      const form = loadSearchForm();
      const defaultForm = buildDefaultSearchForm();

      expect(form).toEqual(defaultForm);
    });

    it('returns default search form when localStorage.getItem throws', () => {
      vi.mocked(mockStorage.getItem).mockImplementation(() => {
        throw new Error('storage error');
      });

      const form = loadSearchForm();
      const defaultForm = buildDefaultSearchForm();

      expect(form).toEqual(defaultForm);
    });
  });

  describe('saveSearchForm', () => {
    it('writes the search form to localStorage as JSON', () => {
      const form: SearchForm = {
        chartType: 'HOT',
        strType: '2',
        searchStartDate: '2025-03-01',
        searchEndDate: '2025-03-25',
      };

      saveSearchForm(form);

      const stored = localStorage.getItem('tjmedia-search-form');

      expect(stored).toBe(JSON.stringify(form));
    });

    it('does not throw when localStorage.setItem throws', () => {
      vi.mocked(mockStorage.setItem).mockImplementation(() => {
        throw new Error('quota exceeded');
      });

      const form = buildDefaultSearchForm();

      expect(() => saveSearchForm(form)).not.toThrow();
    });
  });

  describe('clearSearchForm', () => {
    it('removes the search form from localStorage', () => {
      localStorage.setItem('tjmedia-search-form', '{}');

      clearSearchForm();

      expect(localStorage.getItem('tjmedia-search-form')).toBeNull();
    });

    it('does not throw when localStorage.removeItem throws', () => {
      vi.mocked(mockStorage.removeItem).mockImplementation(() => {
        throw new Error('storage error');
      });

      expect(() => clearSearchForm()).not.toThrow();
    });
  });
});
