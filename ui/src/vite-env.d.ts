/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TJMEDIA_API_URL: string;
  readonly VITE_YOUTUBE_API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
