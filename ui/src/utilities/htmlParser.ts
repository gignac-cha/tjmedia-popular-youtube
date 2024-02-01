const domParser = new DOMParser();

export const parseDOM = (html: string): Document =>
  domParser.parseFromString(html, 'text/html');
