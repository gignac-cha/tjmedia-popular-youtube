import { fetch } from './fetch';

export const getType = (): Type => {
  const type = localStorage.getItem('type');
  switch (type) {
    case '1':
    case '2':
    case '3':
      return type;
    default:
      return '1';
  }
};

const getMusicItemFromRow = (
  tr: HTMLTableRowElement,
): MusicItem | undefined => {
  const [
    indexElement,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _,
    titleElement,
    artistElement,
  ]: HTMLTableCellElement[] = Array.from(
    tr.querySelectorAll<HTMLTableCellElement>('td'),
  );
  if (!indexElement || !titleElement || !artistElement) {
    return;
  }
  const index: number = parseInt(indexElement.textContent ?? '-1');
  const title: string = titleElement.textContent ?? 'error';
  const artist: string = artistElement.textContent ?? 'error';
  return { index, title, artist };
};
const parseMusicList = (newDocument: Document) => {
  const trs: HTMLTableRowElement[] = Array.from(
    newDocument.querySelectorAll<HTMLTableRowElement>('#BoardType1 tr'),
  ).slice(1);

  return trs
    .map((tr: HTMLTableRowElement): MusicItem | undefined =>
      getMusicItemFromRow(tr),
    )
    .filter<MusicItem>(
      (musicItem?: MusicItem): musicItem is MusicItem => !!musicItem,
    );
};

export const getMusicList = async (
  query: TJMediaQuery,
): Promise<MusicItem[]> => {
  const url = new URL(import.meta.env.VITE_TJMEDIA_API_URL);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return parseMusicList(await fetch.html(url));
};
