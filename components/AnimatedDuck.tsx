// components/AnimatedDuck.tsx
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

interface AnimatedDuckProps {
  style?: any;
  duckImageSource?: any;
  shadowImageSource?: any;
  pixelSize?: number;
}

export const AnimatedDuck: React.FC<AnimatedDuckProps> = ({
  style,
  duckImageSource = require("../assets/animals/Duck Full Yellow.png"),
  shadowImageSource = require("../assets/animals/shadow.png"),
  pixelSize = 2,
}) => {
  const frameSize = 16 * pixelSize;   // one frame size
  const columns = 4;                  // 4 frames per row
  const targetRow = 6;                // row we want to animate (0-indexed)
  const totalFrames = columns;        // only 4 frames in this row

  const spriteSheetWidth = columns * frameSize;
  const spriteSheetHeight = 14 * frameSize; // full sheet height

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % totalFrames);
    }, 400); // 200ms per frame = 5 fps
    return () => clearInterval(interval);
  }, []);

  const colIndex = frame;
  const rowIndex = targetRow;

  return (
    <View
      style={[
        styles.character,
        { width: frameSize, height: frameSize }, 
        style,
      ]}
    >
      {/* Shadow */}
      <Image
        source={shadowImageSource}
        style={[styles.shadow, { width: frameSize, height: frameSize }]}
        resizeMode="contain"
      />

      {/* Duck Sprite Sheet */}
      <Image
        source={duckImageSource}
        style={[
          styles.spritesheet,
          {
            width: spriteSheetWidth,
            height: spriteSheetHeight,
            transform: [
              { translateX: -colIndex * frameSize },
              { translateY: -rowIndex * frameSize },
            ],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  character: {
    overflow: "hidden",
    position: "relative",
  },
  shadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  spritesheet: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
