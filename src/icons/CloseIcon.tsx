import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function CloseIcon() {
  return (
    <Svg width="16" height="16" fill="none" viewBox="0 0 35 35">
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="3"
        d="M1.5 33.5l16-16m16-16l-16 16m0 0l-16-16m16 16l16 16"
      />
    </Svg>
  );
}
