import { HTML } from './htmlParser';

export const getVideoList = async (item: MusicItem): Promise<VideoItem[]> => {
  const url = new URL(import.meta.env.VITE_YOUTUBE_API_URL);
  url.searchParams.set('search_query', `${item.title} ${item.artist}`);
  const response: Response = await fetch(url);
  const html: string = await response.text();
  const newDocument: Document = HTML.parse(html);
  const scripts: HTMLScriptElement[] = Array.from(
    newDocument.querySelectorAll<HTMLScriptElement>('script')
  );
  const startKey = 'var ytInitialData = ';
  const [script]: HTMLScriptElement[] = scripts.filter(
    (script: HTMLScriptElement) =>
      (script.textContent ?? '').startsWith(startKey)
  );
  const ytInitialData: YtInitialData = JSON.parse(
    (script.textContent ?? '').slice(startKey.length, -1)
  );
  const items: VideoItem[] = [];
  for (const c1 of ytInitialData.contents.twoColumnSearchResultsRenderer
    .primaryContents.sectionListRenderer.contents) {
    if (c1.itemSectionRenderer) {
      for (const c2 of c1.itemSectionRenderer.contents) {
        if (c2.videoRenderer) {
          const videoId: number = c2.videoRenderer.videoId;
          const thumbnail: YtThumbnail =
            c2.videoRenderer.thumbnail.thumbnails.reduce(
              (previousValue: YtThumbnail, currentValue: YtThumbnail) => {
                const x =
                  (previousValue.width ** 2 + previousValue.height ** 2) ** 0.5;
                const y =
                  (currentValue.width ** 2 + currentValue.height ** 2) ** 0.5;
                return x > y ? previousValue : currentValue;
              }
            );
          for (const r of c2.videoRenderer.title.runs) {
            const title: string = r.text;
            const { width, height }: YtThumbnail = thumbnail;
            items.push({ videoId, title, width, height });
          }
        }
      }
    }
  }
  return items;
};
