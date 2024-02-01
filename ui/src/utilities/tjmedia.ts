import { parseDOM } from './htmlParser';

export const getType = (): Type => {
  switch (localStorage.getItem('type')) {
    default:
    case '1':
      return '1';
    case '2':
      return '2';
    case '3':
      return '3';
  }
};

export const getMusicList = async (
  query: TJMediaQuery
): Promise<MusicItem[]> => {
  const url = new URL(import.meta.env.VITE_TJMEDIA_API_URL);
  const keys: (keyof TJMediaQuery)[] = Object.keys(
    query
  ) as (keyof TJMediaQuery)[];
  for (const key of keys) {
    url.searchParams.set(key, `${query[key]}`);
  }
  const response: Response = await fetch(url);
  const html: string = await response.text();
  const newDocument: Document = parseDOM(html);
  const trs: HTMLTableRowElement[] = Array.from(
    newDocument.querySelectorAll<HTMLTableRowElement>('#BoardType1 tr')
  ).slice(1);
  return trs
    .map((tr: HTMLTableRowElement): MusicItem | undefined => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [
        indexElement,
        _,
        titleElement,
        artistElement,
      ]: HTMLTableCellElement[] = Array.from(
        tr.querySelectorAll<HTMLTableCellElement>('td')
      );
      if (!indexElement || !titleElement || !artistElement) {
        return;
      }
      const index: number = parseInt(indexElement.textContent ?? '-1');
      const title: string = titleElement.textContent ?? 'error';
      const artist: string = artistElement.textContent ?? 'error';
      return { index, title, artist };
    })
    .filter<MusicItem>(
      (musicItem?: MusicItem): musicItem is MusicItem => !!musicItem
    );
};
