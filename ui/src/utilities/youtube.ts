import { parseDOM } from './htmlParser';

const getVideoItems = function* (videoRenderer: YtVideoRenderer) {
  const videoId: number = videoRenderer.videoId;
  const { width, height }: YtThumbnail =
    videoRenderer.thumbnail.thumbnails.reduce(
      (previousValue: YtThumbnail, currentValue: YtThumbnail) => {
        const x = (previousValue.width ** 2 + previousValue.height ** 2) ** 0.5;
        const y = (currentValue.width ** 2 + currentValue.height ** 2) ** 0.5;
        return x > y ? previousValue : currentValue;
      },
    );
  for (const r of videoRenderer.title.runs) {
    const title: string = r.text;
    yield { videoId, title, width, height };
  }
};
const parseVideoList = (html: string) => {
  const newDocument: Document = parseDOM(html);
  const scripts: HTMLScriptElement[] = Array.from(
    newDocument.querySelectorAll<HTMLScriptElement>('script'),
  );
  const startKey = 'var ytInitialData = ';
  const [script]: HTMLScriptElement[] = scripts.filter(
    (script: HTMLScriptElement) =>
      (script.textContent ?? '').startsWith(startKey),
  );
  const ytInitialData: YtInitialData = JSON.parse(
    (script.textContent ?? '').slice(startKey.length, -1),
  );
  const items: VideoItem[] = [];
  for (const { itemSectionRenderer } of ytInitialData.contents
    .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer
    .contents) {
    if (itemSectionRenderer) {
      for (const { videoRenderer } of itemSectionRenderer.contents) {
        if (videoRenderer) {
          items.push(...getVideoItems(videoRenderer));
        }
      }
    }
  }
  return items;
};

export const getVideoList = async (item: MusicItem): Promise<VideoItem[]> => {
  const url = new URL(import.meta.env.VITE_YOUTUBE_API_URL);
  url.searchParams.set('search_query', `${item.title} ${item.artist}`);
  const response: Response = await fetch(url);
  const html: string = await response.text();
  return parseVideoList(html);
};
