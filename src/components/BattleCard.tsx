import React from "react";
import Image from "next/image";
import { DevProfile, Platform } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Trophy, Code, GitCommit, Flame, ExternalLink } from "lucide-react";

interface BattleCardProps {
  profile: DevProfile;
  colorScheme: "cyan" | "pink";
  isWinner?: boolean;
}

export default function BattleCard({ profile, colorScheme, isWinner }: BattleCardProps) {
  const isCyan = colorScheme === "cyan";
  const borderColor = isCyan ? "border-cyan-500/40" : "border-pink-500/40";
  const glowShadow = isCyan ? "shadow-cyan-500/10" : "shadow-pink-500/10";
  const accentText = isCyan ? "text-cyan-400" : "text-pink-400";
  const badgeBg = isCyan ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" : "bg-pink-500/10 text-pink-300 border-pink-500/20";

  return (
    <div
      className={`glass-panel p-6 rounded-2xl border ${borderColor} ${glowShadow} shadow-xl relative flex flex-col justify-between`}
    >
      {isWinner && (
        <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-lg shadow-orange-500/30 uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 fill-black" />
          <span>Match Winner</span>
        </div>
      )}

      {/* Header Profile */}
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 flex-shrink-0">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-extrabold text-white truncate flex items-center gap-2">
            <span>{profile.displayName}</span>
          </h3>
          <p className="text-xs font-mono text-gray-400">@{profile.username}</p>
          {profile.bio && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
              &quot;{profile.bio}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Composite Radar Breakdown */}
      <div className="grid grid-cols-2 gap-2 my-5">
        <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[10px] text-gray-400 font-mono uppercase block">
            Algo Grit
          </span>
          <span className={`text-base font-bold font-mono ${accentText}`}>
            {profile.compositeScore.algorithmicGrit}/100
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[10px] text-gray-400 font-mono uppercase block">
            Git Power
          </span>
          <span className={`text-base font-bold font-mono ${accentText}`}>
            {profile.compositeScore.gitConsistency}/100
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[10px] text-gray-400 font-mono uppercase block">
            Contest Peak
          </span>
          <span className={`text-base font-bold font-mono ${accentText}`}>
            {profile.compositeScore.contestPerformance}/100
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[10px] text-gray-400 font-mono uppercase block">
            Velocity
          </span>
          <span className={`text-base font-bold font-mono ${accentText}`}>
            {profile.compositeScore.velocity}/100
          </span>
        </div>
      </div>

      {/* Active Platforms */}
      <div className="space-y-2 pt-2 border-t border-gray-800/80">
        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
          Platform Records
        </span>
        <div className="space-y-2">
          {Object.entries(profile.platforms).map(([platformKey, stats]) => {
            if (!stats) return null;
            return (
              <div
                key={platformKey}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-900/40 border border-gray-800/40"
              >
                <div className="flex items-center gap-1.5 capitalize font-semibold text-gray-300">
                  <span className={`w-2 h-2 rounded-full ${isCyan ? "bg-cyan-400" : "bg-pink-400"}`} />
                  <span>{platformKey}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  {stats.rating && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] bg-gray-800 text-gray-200">
                      ★ {stats.rating}
                    </span>
                  )}
                  {stats.problemsSolved?.total !== undefined && (
                    <span className="text-gray-400 text-[11px]">
                      {stats.problemsSolved.total} solved
                    </span>
                  )}
                  {stats.metrics?.Followers !== undefined && (
                    <span className="text-gray-400 text-[11px]">
                      {stats.metrics.Followers} followers
                    </span>
                  )}
                  <a
                    href={stats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
