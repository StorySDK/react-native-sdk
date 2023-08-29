import React from 'react';
import type { PlayStatusType } from '../types';

const StoryContext = React.createContext<{
  currentStoryId?: string;
  playStatusChange?: any;
  setForegroundWidget?: any;
  foregroundWidget: string | null;
  playStatus: PlayStatusType;
}>({
  currentStoryId: '',
  playStatus: 'play',
  playStatusChange: () => {},
  setForegroundWidget() {},
  foregroundWidget: null,
});

export default StoryContext;
