interface ImportMetaEnv {
  readonly VITE_TJMEDIA_POPULAR_WORKER_URL?: string;
  readonly VITE_YOUTUBE_SEARCH_WORKER_URL?: string;
  readonly VITEST?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
