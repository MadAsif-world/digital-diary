import React from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import type { IconFamily } from "../constants/modules";

interface Props {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
}

/** Thin wrapper so module defs can reference icons across families uniformly. */
export function AppIcon({ family = "feather", name, size = 20, color = colors.ink }: Props) {
  if (family === "mci") {
    return <MaterialCommunityIcons name={name as never} size={size} color={color} />;
  }
  return <Feather name={name as never} size={size} color={color} />;
}
