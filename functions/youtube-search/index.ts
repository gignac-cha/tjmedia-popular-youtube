interface EventProperties {
  searchParams: Record<string, string>;
}

export const handler = async (event: EventProperties) => {
  const url = new URL('https://www.youtube.com/results');
  const { searchParams = {} } = event;
  for (const key in searchParams) {
    url.searchParams.set(key, searchParams[key]);
  }
  const response = await fetch(url);
  return response.text();
};

if (require.main === module) {
  const main = async () => {
    console.log(
      await handler({
        searchParams: { search_query: '아이유 밤편지' },
      }),
    );
  };
  main();
}
