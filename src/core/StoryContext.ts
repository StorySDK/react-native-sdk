import React from 'react';

const StoryContext = React.createContext<{
  currentStoryId?: string;
  playStatusChange?: any;
  setContentShift?: any;
  setForegroundWidget?: any;
  confetti?: any;
}>({
  currentStoryId: '',
  playStatusChange: () => {},
  setContentShift() {},
  setForegroundWidget() {},
  confetti: null,
});

export default StoryContext;
