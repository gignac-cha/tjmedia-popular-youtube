interface YtInitialDataThumbnail {
  url: string;
  width: number;
  height: number;
}
interface YtInitialData {
  contents: {
    twoColumnSearchResultsRenderer: {
      primaryContents: {
        sectionListRenderer: {
          contents: [
            {
              itemSectionRenderer: {
                contents: [
                  {
                    videoRenderer: {
                      videoId: number;
                      thumbnail: {
                        thumbnails: YtInitialDataThumbnail[];
                      };
                      title: {
                        runs: [
                          {
                            text: string;
                          },
                        ];
                      };
                    };
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
