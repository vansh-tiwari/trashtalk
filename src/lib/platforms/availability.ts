import type { Platform } from "./contracts";
import { isBattleEnabled, parsePlatform } from "./registry";

export function isPlatformLive(platform: Platform): boolean {
  return isBattleEnabled(platform);
}

export function parsePlatformParam(param: unknown): Platform {
  return parsePlatform(param);
}
