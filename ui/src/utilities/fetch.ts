import { getBuiltIn } from './builtIns';
import { parseHTML } from './htmlParser';

const builtInFetch = getBuiltIn('fetch');

const json = async <T>(...args: Parameters<typeof builtInFetch>): Promise<T> =>
  builtInFetch(...args).then((response: Response) => response.json());
const text = async (
  ...args: Parameters<typeof builtInFetch>
): Promise<string> =>
  builtInFetch(...args).then((response: Response) => response.text());
const html = async (
  ...args: Parameters<typeof builtInFetch>
): Promise<Document> => text(...args).then((html: string) => parseHTML(html));

export const fetch = Object.assign(builtInFetch, { json, text, html });
