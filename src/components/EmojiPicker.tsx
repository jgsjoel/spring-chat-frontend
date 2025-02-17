import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export default function EmojiPicker({ onSelectEmoji }:any) {
  return (
    <Picker
      data={data}
      onEmojiSelect={onSelectEmoji}
      emojiSize={20}
      emojiButtonSize={28}
      theme="light"
    />
  );
}