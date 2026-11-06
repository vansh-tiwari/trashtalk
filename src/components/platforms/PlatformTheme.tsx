import React, { type CSSProperties } from "react";
import type { Platform } from "@/lib/platforms/contracts";
import { getPlatformCssVariables } from "@/lib/platforms/theme";

export interface PlatformThemeProps {
  platform: Platform;
  children: React.ReactNode;
  className?: string;
}

export function PlatformTheme({
  platform,
  children,
  className = "",
}: PlatformThemeProps) {
  const cssVars = getPlatformCssVariables(platform) as CSSProperties;

  return (
    <div
      style={cssVars}
      className={className}
      data-platform={platform}
    >
      {children}
    </div>
  );
}

export default PlatformTheme;
