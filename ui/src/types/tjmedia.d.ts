declare type Type = '1' | '2' | '3';

declare type SearchParams = { [key: string]: boolean | number | string };

declare interface TJMediaQuery {
  strType: string;
  SYY: string;
  SMM: string;
  EYY: string;
  EMM: string;
}

declare interface MusicItem {
  index: number;
  title: string;
  artist: string;
}
