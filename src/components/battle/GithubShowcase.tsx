"use client";

import React from "react";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import { Star, GitFork, ExternalLink, Dna, Code2, FolderGit2 } from "lucide-react";

export interface GithubShowcaseProps {
  snapshot: BattleSnapshot;
}

export default function GithubShowcase({ snapshot }: GithubShowcaseProps) {
  const p1 = snapshot.player1;
  const p2 = snapshot.player2;
  const p1Meta = snapshot.githubMetadata?.player1;
  const p2Meta = snapshot.githubMetadata?.player2;
  const overlap = snapshot.overlap;

  // Retrieve top repos from githubMetadata or fallback to solvedProblems/overlap
  const p1Repos = (p1Meta?.topRepos && p1Meta.topRepos.length > 0)
    ? p1Meta.topRepos.slice(0, 5)
    : (overlap.player1Exclusive ?? []).slice(0, 5).map((p) => ({
        name: p.name,
        description: undefined,
        stars: p.rating ?? 0,
        forks: 0,
        language: p.tags?.find((t) => t !== "original" && t !== "fork"),
        url: p.url || `https://github.com/${p1.handle}/${p.name}`,
      }));

  const p2Repos = (p2Meta?.topRepos && p2Meta.topRepos.length > 0)
    ? p2Meta.topRepos.slice(0, 5)
    : (overlap.player2Exclusive ?? []).slice(0, 5).map((p) => ({
        name: p.name,
        description: undefined,
        stars: p.rating ?? 0,
        forks: 0,
        language: p.tags?.find((t) => t !== "original" && t !== "fork"),
        url: p.url || `https://github.com/${p2.handle}/${p.name}`,
      }));

  // Language overlap analysis
  const p1Langs = new Set((p1Meta?.languages ?? []).map((l) => l.name.toLowerCase()));
  const p2Langs = new Set((p2Meta?.languages ?? []).map((l) => l.name.toLowerCase()));

  const sharedLangs: string[] = [];
  const p1ExclusiveLangs: string[] = [];
  const p2ExclusiveLangs: string[] = [];

  for (const l of (p1Meta?.languages ?? [])) {
    if (p2Langs.has(l.name.toLowerCase())) {
      if (!sharedLangs.includes(l.name)) sharedLangs.push(l.name);
    } else {
      p1ExclusiveLangs.push(l.name);
    }
  }

  for (const l of (p2Meta?.languages ?? [])) {
    if (!p1Langs.has(l.name.toLowerCase())) {
      p2ExclusiveLangs.push(l.name);
    }
  }

  const dnaPct = overlap.dnaPercentage ?? 0;

  return (
    <section className="sec2 select-none" aria-label="Open Source Showcase" style={{ paddingTop: "48px" }}>
      {/* Section Header */}
      <div className="sh2">
        <h2>Open Source Showcase</h2>
        <span>Flagship Repositories & Tech Stack DNA</span>
      </div>

      {/* Tech Stack DNA Bar */}
      <div className="p-4 bg-canvas border-2 border-ink mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-punch" />
            <span className="font-mono font-bold text-ink uppercase text-sm">
              Tech Stack DNA Match: {dnaPct}%
            </span>
          </div>
          <span className="text-xs font-mono text-muted">
            Computed from public repository language distributions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs font-mono">
          {/* Shared Languages */}
          <div>
            <div className="text-muted uppercase text-[10px] mb-1 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-ink" /> Shared Languages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sharedLangs.length > 0 ? (
                sharedLangs.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 bg-[#111214] text-[#FFFFFF] font-bold"
                  >
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-muted italic">No mutual languages detected</span>
              )}
            </div>
          </div>

          {/* P1 Exclusive */}
          <div>
            <div className="text-muted uppercase text-[10px] mb-1">
              Unique to @{p1.handle}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p1ExclusiveLangs.length > 0 ? (
                p1ExclusiveLangs.slice(0, 4).map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-canvas border border-rule text-ink">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-muted italic">—</span>
              )}
            </div>
          </div>

          {/* P2 Exclusive */}
          <div>
            <div className="text-muted uppercase text-[10px] mb-1">
              Unique to @{p2.handle}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p2ExclusiveLangs.length > 0 ? (
                p2ExclusiveLangs.slice(0, 4).map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-canvas border border-rule text-punch">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-muted italic">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Repositories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player 1 Flagship Repos */}
        <div className="border-2 border-ink bg-canvas p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-ink" />
              <h3 className="font-mono font-bold text-ink uppercase text-sm">
                @{p1.handle} · Flagship Projects
              </h3>
            </div>
            <span className="text-xs font-mono text-muted">
              {p1Meta?.totalStars ? `${p1Meta.totalStars.toLocaleString()} total stars` : ""}
            </span>
          </div>

          <div className="space-y-3">
            {p1Repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white border border-rule hover:border-ink hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold font-mono text-ink group-hover:text-punch transition-colors flex items-center gap-1.5 text-sm">
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {repo.stars.toLocaleString()}
                    </span>
                    {repo.forks > 0 && (
                      <span className="flex items-center gap-1 text-muted hidden sm:flex">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forks.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {repo.description && (
                  <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}

                {repo.language && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-muted">
                    <span className="w-2 h-2 rounded-full bg-punch inline-block" />
                    <span>{repo.language}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Player 2 Flagship Repos */}
        <div className="border-2 border-ink bg-canvas p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-punch" />
              <h3 className="font-mono font-bold text-punch uppercase text-sm">
                @{p2.handle} · Flagship Projects
              </h3>
            </div>
            <span className="text-xs font-mono text-muted">
              {p2Meta?.totalStars ? `${p2Meta.totalStars.toLocaleString()} total stars` : ""}
            </span>
          </div>

          <div className="space-y-3">
            {p2Repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white border border-rule hover:border-punch hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold font-mono text-ink group-hover:text-punch transition-colors flex items-center gap-1.5 text-sm">
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {repo.stars.toLocaleString()}
                    </span>
                    {repo.forks > 0 && (
                      <span className="flex items-center gap-1 text-muted hidden sm:flex">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forks.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {repo.description && (
                  <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}

                {repo.language && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-muted">
                    <span className="w-2 h-2 rounded-full bg-punch inline-block" />
                    <span>{repo.language}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
