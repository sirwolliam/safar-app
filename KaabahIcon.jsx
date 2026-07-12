import React from "react";
import Svg, { Rect } from "react-native-svg";

const GOLD = "#C8A96A";

export function KaabahIcon({ size = 24, color = "#1A1410", weight = "regular" }) {
  const isFill = weight === "fill";

  if (isFill) {
    return (
      <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
        <Rect x="40" y="72" width="176" height="144" rx="10" fill={color} />
        <Rect x="40" y="106" width="176" height="16" fill={GOLD} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      <Rect
        x="40" y="72" width="176" height="144" rx="10"
        fill="none" stroke={color} strokeWidth="14"
      />
      <Rect x="40" y="106" width="176" height="16" fill={GOLD} />
    </Svg>
  );
}

export default KaabahIcon;
