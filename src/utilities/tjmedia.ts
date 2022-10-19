import { callLambdaFunction, SearchParams } from './aws';
import { HTML } from './htmlParser';

export interface Query extends SearchParams {
  strType: string;
  SYY: string;
  SMM: string;
  SDD: string;
  EYY: string;
  EMM: string;
  EDD: string;
}

export interface MusicItem {
  index: number;
  title: string;
  artist: string;
}

export const getMusicList = async (query: Query): Promise<MusicItem[]> => {
  const html: string = JSON.parse(await callLambdaFunction('tjmedia-popular', query));
  const newDocument: Document = HTML.parse(html);
  const trs: HTMLTableRowElement[] = Array.from(
    newDocument.querySelectorAll<HTMLTableRowElement>('#BoardType1 tr'),
  ).slice(1);
  return trs.map((tr: HTMLTableRowElement): MusicItem => {
    const [indexElement, _, titleElement, artistElement]: HTMLTableCellElement[] = Array.from(
      tr.querySelectorAll<HTMLTableCellElement>('td'),
    );
    const index: number = parseInt(indexElement.textContent!);
    const title: string = titleElement.textContent!;
    const artist: string = artistElement.textContent!;
    return { index, title, artist };
  });
};
