import { Reducer } from 'react';

export const initialState: {
  isPrepared: boolean;
  isExpanded: boolean;
  cachedItems: VideoItem[];
  selectedIndex: number;
  isVideoLoading: boolean;
} = {
  isPrepared: false,
  isExpanded: false,
  cachedItems: [],
  selectedIndex: 0,
  isVideoLoading: false,
};

type VideoAction =
  | { name: 'PREPARE_VIDEO_FRAME' }
  | { name: 'EXPAND_ITEM' }
  | { name: 'COLLAPSE_ITEM' }
  | { name: 'CACHE_ITEMS'; items: VideoItem[] }
  | { name: 'REMOVE_ITEMS_CACHE' }
  | { name: 'PREVIOUS_ITEM' }
  | { name: 'NEXT_ITEM' }
  | { name: 'VIDEO_LOADED' };

export const videoReducer: Reducer<typeof initialState, VideoAction> = (
  prevState,
  action,
) => {
  switch (action.name) {
    case 'PREPARE_VIDEO_FRAME':
      return { ...prevState, isPrepared: true };
    case 'EXPAND_ITEM':
      return { ...prevState, isExpanded: true };
    case 'COLLAPSE_ITEM':
      return { ...prevState, isExpanded: false };
    case 'CACHE_ITEMS':
      return { ...prevState, cachedItems: action.items };
    case 'REMOVE_ITEMS_CACHE':
      return { ...prevState, cachedItems: [] };
    case 'PREVIOUS_ITEM':
      return {
        ...prevState,
        selectedIndex: Math.max(0, prevState.selectedIndex - 1),
        isVideoLoading: true,
      };
    case 'NEXT_ITEM':
      return {
        ...prevState,
        selectedIndex: Math.min(
          prevState.selectedIndex + 1,
          prevState.cachedItems.length - 1,
        ),
        isVideoLoading: true,
      };
    case 'VIDEO_LOADED':
      return { ...prevState, isVideoLoading: false };
  }
};
