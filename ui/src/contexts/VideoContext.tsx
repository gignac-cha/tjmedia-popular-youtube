import { PropsWithChildren, createContext, useCallback, useContext, useReducer } from 'react';
import { initialState, videoReducer } from '../reducers/videoReducer';
import { doNothing, typed } from '../utilities/common';

export const defaultValue = {
  ...initialState,
  expandItem: typed<() => void>(doNothing),
  collapseItem: typed<() => void>(doNothing),
  cacheItems: typed<(items: VideoItem[]) => void>(doNothing),
  removeItemsCache: typed<() => void>(doNothing),
  previousItem: typed<() => void>(doNothing),
  nextItem: typed<() => void>(doNothing),
  videoLoaded: typed<() => void>(doNothing),
};

export const VideoContext = Object.assign(createContext(defaultValue), {
  Provider: ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(videoReducer, initialState);

    return (
      <VideoContext.Provider
        value={{
          ...state,
          expandItem: useCallback(() => dispatch({ name: 'EXPAND_ITEM' }), []),
          collapseItem: useCallback(() => dispatch({ name: 'COLLAPSE_ITEM' }), []),
          cacheItems: useCallback((items) => dispatch({ name: 'CACHE_ITEMS', items }), []),
          removeItemsCache: useCallback(() => dispatch({ name: 'REMOVE_ITEMS_CACHE' }), []),
          previousItem: useCallback(() => dispatch({ name: 'PREVIOUS_ITEM' }), []),
          nextItem: useCallback(() => dispatch({ name: 'NEXT_ITEM' }), []),
          videoLoaded: useCallback(() => dispatch({ name: 'VIDEO_LOADED' }), []),
        }}
      >
        {children}
      </VideoContext.Provider>
    );
  },
});

export const useVideoContext = () => useContext(VideoContext);
