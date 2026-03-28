import { useRef, useState, useEffect, useCallback } from 'react';

let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (apiLoadingPromise !== null) {
    return apiLoadingPromise;
  }

  apiLoadingPromise = new Promise<void>((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });

  return apiLoadingPromise;
}

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'buffering' | 'ended';

function toPlayerState(state: number): PlayerState {
  switch (state) {
    case YT.PlayerState.PLAYING: return 'playing';
    case YT.PlayerState.PAUSED: return 'paused';
    case YT.PlayerState.BUFFERING: return 'buffering';
    case YT.PlayerState.ENDED: return 'ended';
    default: return 'unstarted';
  }
}

export function useYouTubePlayer(container: HTMLDivElement | null) {
  const playerReference = useRef<YT.Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('unstarted');
  const [isReady, setIsReady] = useState(false);
  const currentVideoId = useRef<string | null>(null);

  useEffect(() => {
    if (container === null) return;

    let destroyed = false;

    loadYouTubeIframeAPI().then(() => {
      if (destroyed) return;

      const playerTarget = document.createElement('div');
      container.appendChild(playerTarget);

      playerReference.current = new YT.Player(playerTarget, {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!destroyed) {
              setIsReady(true);

              if (currentVideoId.current !== null) {
                playerReference.current?.cueVideoById(currentVideoId.current);
              }
            }
          },
          onStateChange: (event) => {
            if (!destroyed) {
              setPlayerState(toPlayerState(event.data));
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerReference.current?.destroy();
      playerReference.current = null;
      setIsReady(false);
      setPlayerState('unstarted');
    };
  }, [container]);

  const loadVideo = useCallback((videoId: string) => {
    currentVideoId.current = videoId;

    if (isReady && playerReference.current !== null) {
      playerReference.current.cueVideoById(videoId);
    }
  }, [isReady]);

  return { playerState, isReady, loadVideo };
}
