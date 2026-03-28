declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  type PlayerEvent = {
    target: Player;
    data: number;
  };

  type PlayerOptions = {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      rel?: 0 | 1;
      modestbranding?: 0 | 1;
      playsinline?: 0 | 1;
      enablejsapi?: 0 | 1;
      origin?: string;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: PlayerEvent) => void;
      onError?: (event: PlayerEvent) => void;
    };
  };

  class Player {
    constructor(element: HTMLElement | string, options: PlayerOptions);
    loadVideoById(videoId: string): void;
    cueVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    destroy(): void;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
  }
}

interface Window {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
}
