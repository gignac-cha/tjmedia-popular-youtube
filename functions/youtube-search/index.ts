interface EventProperties {
  queryStringParameters: Record<string, string>;
}

export const handler = async (event: EventProperties) => {
  const url = new URL('https://www.youtube.com/results');
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
        queryStringParameters: { search_query: '아이유 밤편지' },
      }),
    );
  };
  main();
}
