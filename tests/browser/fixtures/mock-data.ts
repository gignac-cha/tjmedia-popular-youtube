export const MOCK_SONGS = [
  {
    rank: '1',
    pro: 10001,
    indexTitle: '봄날',
    indexSong: 'BTS',
    word: '봄날',
    com: 'TJ',
    imgthumb_path: 'https://example.com/thumb1.jpg',
    mv_yn: 'Y',
  },
  {
    rank: '2',
    pro: 10002,
    indexTitle: 'Dynamite',
    indexSong: 'BTS',
    word: 'Dynamite',
    com: 'TJ',
    imgthumb_path: 'https://example.com/thumb2.jpg',
    mv_yn: 'Y',
  },
  {
    rank: '3',
    pro: 10003,
    indexTitle: 'Butter',
    indexSong: 'BTS',
    word: 'Butter',
    com: 'TJ',
    imgthumb_path: 'https://example.com/thumb3.jpg',
    mv_yn: 'Y',
  },
];

export const MOCK_TJMEDIA_RESPONSE = {
  resultCode: '99',
  resultMsg: 'success',
  resultData: {
    items: MOCK_SONGS,
  },
};

export const MOCK_YOUTUBE_SINGLE_RESPONSE = {
  query: '봄날 BTS',
  items: [
    {
      videoId: 'abc123',
      title: '봄날 - BTS Official MV',
      thumbnailUrl: 'https://example.com/yt-thumb1.jpg',
      source: 'youtube',
      width: 480,
      height: 360,
    },
  ],
};

export const MOCK_YOUTUBE_MULTI_RESPONSE = {
  query: '봄날 BTS',
  items: [
    {
      videoId: 'vid001',
      title: '봄날 - BTS Official MV',
      thumbnailUrl: 'https://example.com/yt-thumb1.jpg',
      source: 'youtube',
      width: 480,
      height: 360,
    },
    {
      videoId: 'vid002',
      title: '봄날 - BTS Live',
      thumbnailUrl: 'https://example.com/yt-thumb2.jpg',
      source: 'youtube',
      width: 480,
      height: 360,
    },
    {
      videoId: 'vid003',
      title: '봄날 - BTS Dance Practice',
      thumbnailUrl: 'https://example.com/yt-thumb3.jpg',
      source: 'youtube',
      width: 480,
      height: 360,
    },
  ],
};

export const MOCK_YOUTUBE_EMPTY_RESPONSE = {
  query: '봄날 BTS',
  items: [],
};

/** song-list.spec.ts 용 헬퍼 */
export function buildMockSong(rank: number) {
  return {
    rank: String(rank),
    pro: 90000 + rank,
    indexTitle: `테스트 노래 ${rank}`,
    indexSong: `아티스트 ${rank}`,
    word: '',
    com: '',
    imgthumb_path: `https://via.placeholder.com/48?text=${rank}`,
    mv_yn: 'Y',
  };
}

export function buildMockResponse(count: number) {
  return {
    resultCode: '99',
    resultMsg: 'OK',
    resultData: {
      items: Array.from({ length: count }, (_, index) => buildMockSong(index + 1)),
    },
  };
}

export function buildLongTextSong() {
  return {
    rank: '1',
    pro: 99999,
    indexTitle:
      '이 노래 제목은 아주아주아주아주아주 길어서 화면에 다 표시되지 않고 말줄임 처리가 됩니다 확인용 텍스트입니다',
    indexSong:
      '이 아티스트 이름도 매우매우매우매우 길어서 화면에 다 표시되지 않고 말줄임 처리가 됩니다 확인용 텍스트입니다',
    word: '',
    com: '',
    imgthumb_path: 'https://via.placeholder.com/48?text=long',
    mv_yn: 'Y',
  };
}
