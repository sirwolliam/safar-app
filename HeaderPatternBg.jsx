import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Mask, Rect } from "react-native-svg";
import { PATTERN_PATH } from "./screens/headerPatternPath";

export default function HeaderPatternBg({ width }) {
  const scale = width / 375;
  const vh    = 133.62 * scale;
  return (
    <Svg
      width={width}
      height={vh}
      viewBox="0 0 375 133.62"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id="hpGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#fff" stopOpacity="1" />
          <Stop offset="0.7" stopColor="#fff" stopOpacity="0.4" />
          <Stop offset="1"   stopColor="#fff" stopOpacity="0" />
        </LinearGradient>
        <Mask id="hpMask">
          <Rect width="375" height="133.62" fill="url(#hpGrad)" />
        </Mask>
      </Defs>
      <Path
        d={PATTERN_PATH}
        fill="#bf9f60"
        opacity="0.65"
        mask="url(#hpMask)"
      />
    </Svg>
  );
}
