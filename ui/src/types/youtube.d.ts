declare interface YouTubeQuery {
  search_query: string;
}

declare interface YtThumbnail {
  url: string;
  width: number;
  height: number;
}
declare interface YtVideoRenderer {
  videoId: number;
  thumbnail: {
    thumbnails: YtThumbnail[];
  };
  title: {
    runs: [
      {
        text: string;
      }
    ];
  };
}
declare interface YtInitialData {
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
                  }
                ];
              };
            }
          ];
        };
      };
    };
  };
}

declare interface VideoItem {
  videoId: number;
  title: string;
  width: number;
  height: number;
}
