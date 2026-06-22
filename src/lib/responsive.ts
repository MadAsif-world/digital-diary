import { useWindowDimensions } from "react-native";

/**
 * Breakpoint helpers. The planner adapts between a single-column phone layout
 * and a sidebar + grid tablet dashboard.
 */
export const BREAKPOINTS = {
  tablet: 720, // >= this width we switch to the dashboard/sidebar layout
  wide: 1080, // 3-column dashboard grid
} as const;

export type LayoutKind = "phone" | "tablet" | "wide";

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isWide = width >= BREAKPOINTS.wide;
  const kind: LayoutKind = isWide ? "wide" : isTablet ? "tablet" : "phone";

  return {
    width,
    height,
    isPhone: !isTablet,
    isTablet,
    isWide,
    kind,
    /** Dashboard grid columns by available width. */
    gridColumns: isWide ? 3 : isTablet ? 2 : 1,
  };
}
