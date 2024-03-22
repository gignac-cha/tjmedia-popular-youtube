declare interface YouTubeQuery {
  search_query: string;
}

declare interface YtThumbnail {
  url: string;
  width: number;
  height: number;
}
declare interface YtVideoRenderer {
  videoId: string;
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

declare interface VideoItem {
  videoId: string;
  title: string;
  width: number;
  height: number;
}
