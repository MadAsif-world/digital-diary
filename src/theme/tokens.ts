import { Platform } from "react-native";

/**
 * Spacing, radius, and typographic tokens for the luxe planner aesthetic.
 * The signature look is uppercase, wide letter-spacing labels on near-black
 * surfaces with gold accents.
 */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

/**
 * Soft shadows. On web RN deprecates the `shadow*` props in favour of
 * `boxShadow`, so we branch by platform to keep the console clean while
 * preserving native iOS shadow + Android elevation.
 */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: "0px 8px 16px rgba(0,0,0,0.35)" },
    default: {
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }) as object,
  soft: Platform.select({
    web: { boxShadow: "0px 4px 8px rgba(0,0,0,0.25)" },
    default: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  }) as object,
} as const;

/** Letter-spacing presets that define the planner's "luxury" voice. */
export const tracking = {
  luxe: 3,
  wide: 1.5,
  normal: 0,
} as const;
