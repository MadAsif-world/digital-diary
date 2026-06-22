/**
 * Digital Diary — core color palette.
 * Mirrors tailwind.config.js so we can reach the same values from places where
 * className styling isn't ergonomic (icon tint, native pickers, SVG, gradients).
 */
export const colors = {
  bg: "#111111",
  bgDeep: "#0C0C0C",
  card: "#1E1E1E",
  elevated: "#2A2A2A",
  border: "#333333",

  ink: "#FFFFFF",
  inkMuted: "#A8A8A8",
  inkFaint: "#6E6E6E",

  gold: "#D9C84E",
  goldSoft: "#E7DC8C",
  love: "#D7263D",
  loveSoft: "#F06A78",
  success: "#4ECB9A",
  warning: "#E0A458",

  transparent: "transparent",
} as const;

export type ColorToken = keyof typeof colors;
