const domParser = new DOMParser();

export const parseHTML = (html: string): Document =>
  domParser.parseFromString(html, 'text/html');
