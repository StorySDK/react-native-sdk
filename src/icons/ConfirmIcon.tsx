import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  color?: string;
}

export function ConfirmIcon({ color }: Props) {
  return (
    <Svg fill="none" height="20" stroke="black" viewBox="0 0 20 20" width="20">
      <Path
        d="M1.5 9.5C3.66667 11.6667 9 17 9 17L18.5 3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        stroke={color}
      />
    </Svg>
  );
}
