import React from 'react';

interface StatusBarContextType {
  backgroundColor: string;
  scrollAfterAnimation: boolean;
  setBackgroundColor(value: string): void;
}

const initialState: StatusBarContextType = {
  backgroundColor: '#000',
  scrollAfterAnimation: true,
  setBackgroundColor(){},
}

const StatusBarContext = React.createContext(initialState);

export default StatusBarContext;
