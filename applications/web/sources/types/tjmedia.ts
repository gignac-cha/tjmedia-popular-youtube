export type ChartType = 'TOP' | 'HOT';
export type GenreType = '1' | '2' | '3';

export type SearchForm = {
  chartType: ChartType;
  searchStartDate: string;
  searchEndDate: string;
  strType: GenreType;
};

export type TjmediaItem = {
  rank: string;
  pro: number;
  indexTitle: string;
  indexSong: string;
  word: string;
  com: string;
  imgthumb_path: string;
  mv_yn: string;
};

export type TjmediaResponse = {
  resultCode: string;
  resultMsg?: string;
  resultData?: {
    items?: TjmediaItem[];
  };
};
