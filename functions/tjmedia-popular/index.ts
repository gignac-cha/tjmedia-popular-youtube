interface EventProperties {
  queryStringParameters: Record<string, string>;
}

export const handler = async (event: EventProperties) => {
  const url = new URL('http://www.tjmedia.co.kr/tjsong/song_monthPopular.asp');
  const { queryStringParameters = {} } = event;
  for (const key in queryStringParameters) {
    url.searchParams.set(key, queryStringParameters[key]);
  }
  const response = await fetch(url);
  return response.text();
};

if (require.main === module) {
  const main = async () => {
    console.log(
      await handler({
        queryStringParameters: {
          strType: '1',
          SYY: '2023',
          SMM: '04',
          EYY: '2023',
          EMM: '05',
        },
      }),
    );
  };
  main();
}
