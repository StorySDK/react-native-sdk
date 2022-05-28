import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  color?: string;
}

export function DeclineIcon({ color }: Props) {
  return (
    <Svg fill="none" height="20" stroke="black" viewBox="0 0 20 20" width="20">
      <Path
        d="M17 3L10 10M3 17L10 10M10 10L3 3M10 10L17 17"
        strokeLinecap="round"
        strokeWidth="1.5"
        stroke={color}
      />
    </Svg>
  );
}
