import { callLambdaFunction, SearchParams } from './aws';
import { HTML } from './htmlParser';

export interface Query extends SearchParams {
  strType: string;
  SYY: string;
  SMM: string;
  EYY: string;
  EMM: string;
}

export interface MusicItem {
  index: number;
  title: string;
  artist: string;
}

export const getMusicList = async (query: Query): Promise<MusicItem[]> => {
  const url = new URL('https://9wwj125oz1.execute-api.ap-northeast-2.amazonaws.com/');
  for (const key in query) {
    url.searchParams.set(key, `${query[key]}`);
  }
  const response: Response = await fetch(url);
  const html: string = await response.text();
  const newDocument: Document = HTML.parse(html);
  const trs: HTMLTableRowElement[] = Array.from(newDocument.querySelectorAll<HTMLTableRowElement>('#BoardType1 tr')).slice(1);
  return trs
    .map((tr: HTMLTableRowElement): MusicItem | undefined => {
      const [indexElement, _, titleElement, artistElement]: HTMLTableCellElement[] = Array.from(tr.querySelectorAll<HTMLTableCellElement>('td'));
      if (!indexElement || !titleElement || !artistElement) {
        return;
      }
      const index: number = parseInt(indexElement.textContent!);
      const title: string = titleElement.textContent!;
      const artist: string = artistElement.textContent!;
      return { index, title, artist };
    })
    .filter<MusicItem>((musicItem?: MusicItem): musicItem is MusicItem => !!musicItem);
};
