import { SearchParams } from './aws';
import { HTML } from './htmlParser';
import { MusicItem } from './tjmedia';

export interface Query extends SearchParams {
  search_query: string;
}

export interface YtThumbnail {
  url: string;
  width: number;
  height: number;
}
export interface YtVideoRenderer {
  videoId: number;
  thumbnail: {
    thumbnails: YtThumbnail[];
  };
  title: {
    runs: [
      {
        text: string;
      },
    ];
  };
}
export interface YtInitialData {
  contents: {
    twoColumnSearchResultsRenderer: {
      primaryContents: {
        sectionListRenderer: {
          contents: [
            {
              itemSectionRenderer: {
                contents: [
                  {
                    videoRenderer: YtVideoRenderer;
                  },
                ];
              };
            },
          ];
        };
      };
    };
  };
}

export interface VideoItem {
  videoId: number;
  title: string;
  width: number;
  height: number;
}

export const getVideoList = async (item: MusicItem): Promise<VideoItem[]> => {
  const url = new URL('https://f1jh9sup93.execute-api.ap-northeast-2.amazonaws.com/');
  url.searchParams.set('search_query', `${item.title} ${item.artist}`);
  const response: Response = await fetch(url);
  const html: string = await response.text();
  const newDocument: Document = HTML.parse(html);
  const scripts: HTMLScriptElement[] = Array.from(newDocument.querySelectorAll<HTMLScriptElement>('script'));
  const startKey = 'var ytInitialData = ';
  const [script]: HTMLScriptElement[] = scripts.filter((script: HTMLScriptElement) => (script.textContent ?? '').startsWith(startKey));
  const ytInitialData: YtInitialData = JSON.parse((script.textContent ?? '').slice(startKey.length, -1));
  const items: VideoItem[] = [];
  for (const c1 of ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents) {
    if (c1.itemSectionRenderer) {
      for (const c2 of c1.itemSectionRenderer.contents) {
        if (c2.videoRenderer) {
          const videoId: number = c2.videoRenderer.videoId;
          const thumbnail: YtThumbnail = c2.videoRenderer.thumbnail.thumbnails.reduce((previousValue: YtThumbnail, currentValue: YtThumbnail) => {
            const x = (previousValue.width ** 2 + previousValue.height ** 2) ** 0.5;
            const y = (currentValue.width ** 2 + currentValue.height ** 2) ** 0.5;
            return x > y ? previousValue : currentValue;
          });
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
