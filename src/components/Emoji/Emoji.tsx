import React from 'react';
import { Image } from 'react-native';

const emojiList = require('./emojiList.json');

interface Props {
  emoji: string;
  size: number;
}

const Emoji: React.FC<Props> = (props) => {
  const emojiUrl = emojiList[`U+${props.emoji}`.toUpperCase()];

  return (
    <Image
      source={{ uri: emojiUrl }}
      style={{ width: props.size, height: props.size }}
    />
  );
};

export default Emoji;
