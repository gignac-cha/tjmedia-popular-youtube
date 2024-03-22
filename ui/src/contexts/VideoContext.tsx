import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { initialState, videoReducer } from '../reducers/videoReducer';
import { doNothing } from '../utilities/common';

export const defaultValue: typeof initialState & {
  expandItem: () => void;
  collapseItem: () => void;
  cacheItems: (items: VideoItem[]) => void;
  removeItemsCache: () => void;
  previousItem: () => void;
  nextItem: () => void;
  videoLoaded: () => void;
} = {
  ...initialState,
  expandItem: doNothing,
  collapseItem: doNothing,
  cacheItems: doNothing,
  removeItemsCache: doNothing,
  previousItem: doNothing,
  nextItem: doNothing,
  videoLoaded: doNothing,
};

const VideoContext = createContext<typeof defaultValue>(defaultValue);

export const VideoContextProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  const expandItem = useCallback(() => dispatch({ name: 'EXPAND_ITEM' }), []);
  const collapseItem = useCallback(
    () => dispatch({ name: 'COLLAPSE_ITEM' }),
    [],
  );
  const cacheItems = useCallback(
    (items: VideoItem[]) => dispatch({ name: 'CACHE_ITEMS', items }),
    [],
  );
  const removeItemsCache = useCallback(
    () => dispatch({ name: 'REMOVE_ITEMS_CACHE' }),
    [],
  );
  const previousItem = useCallback(
    () => dispatch({ name: 'PREVIOUS_ITEM' }),
    [],
  );
  const nextItem = useCallback(() => dispatch({ name: 'NEXT_ITEM' }), []);
  const videoLoaded = useCallback(() => dispatch({ name: 'VIDEO_LOADED' }), []);

  return (
    <VideoContext.Provider
      value={{
        ...state,
        expandItem,
        collapseItem,
        cacheItems,
        removeItemsCache,
        previousItem,
        nextItem,
        videoLoaded,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
