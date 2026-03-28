import type { GenreType, SearchForm } from '../types/tjmedia.ts';
import { buildThisMonthDateRange } from './dates.ts';

export type GenreLabel = 'korean' | 'english' | 'japanese';

const GENRE_LABEL_TO_STR_TYPE: Record<GenreLabel, GenreType> = {
  korean: '1',
  english: '2',
  japanese: '3',
};

const STR_TYPE_TO_GENRE_LABEL: Record<GenreType, GenreLabel> = {
  '1': 'korean',
  '2': 'english',
  '3': 'japanese',
};

const DEFAULT_GENRE_LABEL: GenreLabel = 'korean';
const DEFAULT_CHART_TYPE = 'TOP' as const;

function isGenreLabel(value: string): value is GenreLabel {
  return value in GENRE_LABEL_TO_STR_TYPE;
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function parseSearchFormFromURL(searchParameters: URLSearchParams): SearchForm {
  const typeParameter = searchParameters.get('type');
  const fromParameter = searchParameters.get('from');
  const toParameter = searchParameters.get('to');

  const strType =
    typeParameter !== null && isGenreLabel(typeParameter)
      ? GENRE_LABEL_TO_STR_TYPE[typeParameter]
      : GENRE_LABEL_TO_STR_TYPE[DEFAULT_GENRE_LABEL];

  const defaultDateRange = buildThisMonthDateRange();

  const searchStartDate =
    fromParameter !== null && isValidDateString(fromParameter)
      ? fromParameter
      : defaultDateRange.searchStartDate;

  const searchEndDate =
    toParameter !== null && isValidDateString(toParameter)
      ? toParameter
      : defaultDateRange.searchEndDate;

  return {
    chartType: DEFAULT_CHART_TYPE,
    strType,
    searchStartDate,
    searchEndDate,
  };
}

export function parseRankFromURL(searchParameters: URLSearchParams): number | null {
  const rankParameter = searchParameters.get('rank');

  if (rankParameter === null) {
    return null;
  }

  const parsed = Number.parseInt(rankParameter, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function buildSearchParameters(
  searchForm: SearchForm,
  rank: number | null,
): URLSearchParams {
  const defaultDateRange = buildThisMonthDateRange();
  const parameters = new URLSearchParams();

  const genreLabel = STR_TYPE_TO_GENRE_LABEL[searchForm.strType];

  if (genreLabel !== DEFAULT_GENRE_LABEL) {
    parameters.set('type', genreLabel);
  }

  if (searchForm.searchStartDate !== defaultDateRange.searchStartDate) {
    parameters.set('from', searchForm.searchStartDate);
  }

  if (searchForm.searchEndDate !== defaultDateRange.searchEndDate) {
    parameters.set('to', searchForm.searchEndDate);
  }

  if (rank !== null) {
    parameters.set('rank', String(rank));
  }

  return parameters;
}

export function buildPermalinkURL(
  searchForm: SearchForm,
  rank: number | null,
): string {
  const parameters = buildSearchParameters(searchForm, rank);
  const queryString = parameters.toString();

  const basePath = import.meta.env.BASE_URL;

  return queryString.length > 0 ? `${basePath}?${queryString}` : basePath;
}

export function pushPermalink(
  searchForm: SearchForm,
  rank: number | null,
): void {
  const url = buildPermalinkURL(searchForm, rank);

  window.history.replaceState(null, '', url);
}
