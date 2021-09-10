export const parse = (html: string): Document => {
  const domParser = new DOMParser();
  return domParser.parseFromString(html, 'text/html');
};
