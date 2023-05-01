const domParser = new DOMParser();

const parse = (html: string): Document => domParser.parseFromString(html, 'text/html');

export const HTML = { parse };
