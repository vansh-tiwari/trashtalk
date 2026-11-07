"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import MatchStatus, { MatchStatusState } from "./MatchStatus";
import type { Platform } from "@/lib/platforms/contracts";
import { PLATFORM_REGISTRY, isBattleEnabled, parsePlatform } from "@/lib/platforms/registry";
import type { RoastPersona } from "@/lib/ai/schemas";
import { parseRetryAfterMs, prepareBattleRequest } from "@/lib/battle/entry";

export interface CompareFormProps {
  platform?: Platform;
  initialHandles?: { u1?: string; u2?: string } | [string, string];
  initialU1?: string;
  initialU2?: string;
  initialPersona?: RoastPersona;
  mode?: "battle" | "mirror";
  onCreated?: (battleId: string) => void;
  onPlatformChange?: (platform: Platform) => void;
  className?: string;
}

export default function CompareForm({
  platform = "codeforces",
  initialHandles,
  initialU1,
  initialU2,
  initialPersona = "savage_dev",
  mode = "battle",
  onCreated,
  onPlatformChange,
  className = "",
}: CompareFormProps) {
  const resolvedInitU1 =
    initialU1 ?? (Array.isArray(initialHandles) ? initialHandles[0] : initialHandles?.u1) ?? "";
  const resolvedInitU2 =
    initialU2 ?? (Array.isArray(initialHandles) ? initialHandles[1] : initialHandles?.u2) ?? "";

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platform);

  useEffect(() => {
    setSelectedPlatform(platform);
  }, [platform]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPlatform = params.get("platform");
      if (urlPlatform) {
        const parsed = parsePlatform(urlPlatform);
        setSelectedPlatform(parsed);
        onPlatformChange?.(parsed);
      }
    }
  }, [onPlatformChange]);
  const [u1, setU1] = useState(resolvedInitU1);
  const [u2, setU2] = useState(resolvedInitU2);

  const lastPrefillU1 = useRef(resolvedInitU1);
  const lastPrefillU2 = useRef(resolvedInitU2);

  useEffect(() => {
    if (resolvedInitU1 !== lastPrefillU1.current) {
      lastPrefillU1.current = resolvedInitU1;
      setU1(resolvedInitU1);
    }
  }, [resolvedInitU1]);

  useEffect(() => {
    if (resolvedInitU2 !== lastPrefillU2.current) {
      lastPrefillU2.current = resolvedInitU2;
      setU2(resolvedInitU2);
    }
  }, [resolvedInitU2]);

  const [persona] = useState<RoastPersona>(initialPersona);
  const [status, setStatus] = useState<MatchStatusState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (status === "submitting" || status === "cooldown" || status === "busy") {
      return;
    }

    if (!isBattleEnabled(selectedPlatform)) {
      setStatus("error");
      setErrorMessage(
        `${PLATFORM_REGISTRY[selectedPlatform]?.label || selectedPlatform} battles are coming soon. Switch to Codeforces or LeetCode to battle now.`
      );
      return;
    }

    const cleanU1 = u1.trim();
    const cleanU2 = mode === "mirror" ? cleanU1 : u2.trim();

    if (!cleanU1 || !cleanU2) {
      setStatus("error");
      setErrorMessage(
        `Please enter both ${PLATFORM_REGISTRY[selectedPlatform]?.label || selectedPlatform} handles to compare.`
      );
      return;
    }

    let prepared;
    try {
      prepared = prepareBattleRequest({
        platform: selectedPlatform,
        u1: cleanU1,
        u2: cleanU2,
        persona,
      });
    } catch (gateErr) {
      setStatus("error");
      setErrorMessage(gateErr instanceof Error ? gateErr.message : "Unsupported platform.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const clientTimezone =
      typeof Intl !== "undefined" && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined;
    const clientLang = typeof navigator !== "undefined" ? navigator.language : undefined;

    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `form-${Date.now()}`;

    try {
      const res = await fetch("/api/battles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          ...prepared,
          clientTimezone,
          clientLang,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429) {
          const retryAfterHeader = res.headers.get("retry-after");
          const cooldownMs = parseRetryAfterMs(retryAfterHeader, Date.now());
          const seconds = Math.ceil(cooldownMs / 1000);

          setStatus("cooldown");
          setCooldownRemaining(seconds);

          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = setInterval(() => {
            setCooldownRemaining((prev) => {
              if (prev <= 1) {
                if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            setStatus("idle");
          }, cooldownMs);

          return;
        }

        const msg = data?.error || `Server responded with status ${res.status}`;
        setStatus("error");
        setErrorMessage(msg);
        return;
      }

      if (!data || !data.id) {
        setStatus("error");
        setErrorMessage("Couldn’t open that match. Try again.");
        return;
      }

      if (onCreated) {
        onCreated(data.id);
      } else {
        window.location.href = `/battle/${data.id}`;
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create comparison. Please try again."
      );
    }
  }

  const isPending = status === "submitting" || status === "cooldown" || status === "busy";

  const PLATFORM_DISPLAY_ORDER: Platform[] = [
    "codeforces",
    "leetcode",
    "codechef",
    "github",
  ];

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="w-full" aria-busy={isPending}>
        {/* Inner Brutalist Card containing Platform Tabs & Inputs */}
        <div className="form-strip-container">
          {/* Full-Width Rectangular Platform Chips Strip */}
        <div className="platform-chips" role="tablist" aria-label="Battle Platform">
          {PLATFORM_DISPLAY_ORDER.map((pid) => {
            const p = PLATFORM_REGISTRY[pid];
            const isSelected = selectedPlatform === pid;
            return (
              <button
                key={pid}
                type="button"
                role="tab"
                id={`tab-${pid}`}
                aria-selected={isSelected}
                aria-controls={`panel-${pid}`}
                onClick={() => {
                  setSelectedPlatform(pid);
                  setErrorMessage(null);
                  onPlatformChange?.(pid);
                }}
                disabled={isPending}
                className={`chip-btn ${isSelected ? "active" : ""}`}
              >
                <span className="chip-name">{p.label}</span>
                <span className={`chip-badge ${p.status}`}>{p.availabilityLabel}</span>
              </button>
            );
          })}
        </div>

        {!isBattleEnabled(selectedPlatform) ? (
          <div className="platform-preview-panel" role="tabpanel" id={`panel-${selectedPlatform}`}>
            <div className="preview-message">
              <span className="preview-title">
                {`${PLATFORM_REGISTRY[selectedPlatform]?.label || selectedPlatform} is coming later.`}
              </span>
              <span className="preview-sub">Battles are currently live on Codeforces, LeetCode, CodeChef, and GitHub. Drop two handles to get the receipt.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlatform("codeforces");
                setErrorMessage(null);
                onPlatformChange?.("codeforces");
              }}
              className="fb o preview-switch-btn"
            >
              try Codeforces
            </button>
          </div>
        ) : (
          /* The Brutalist Input Bar (.bar) */
          <div className="bar" role="tabpanel" id={`panel-${selectedPlatform}`}>
            <input
              id="you"
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={u1}
              onChange={(e) => setU1(e.target.value)}
              disabled={isPending}
              placeholder={
                selectedPlatform === "github"
                  ? "torvalds"
                  : selectedPlatform === "leetcode"
                  ? "neetcode"
                  : selectedPlatform === "codechef"
                  ? "akulsareen"
                  : "player_one"
              }
              aria-label="Player 1 handle"
            />

            <b className="big vsm select-none" aria-hidden="true">
              vs
            </b>

            <input
              id="rival"
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={u2}
              onChange={(e) => setU2(e.target.value)}
              disabled={isPending}
              placeholder={
                selectedPlatform === "github"
                  ? "antirez"
                  : selectedPlatform === "leetcode"
                  ? "larryny"
                  : selectedPlatform === "codechef"
                  ? "gennady"
                  : "player_two"
              }
              aria-label="Player 2 handle"
            />

            <button
              type="submit"
              disabled={isPending}
              className={`fb o ${status === "submitting" ? "is-fighting" : ""}`}
              aria-label="Fight (settle it)"
              aria-busy={status === "submitting"}
            >
              {status === "submitting" ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Swords className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>FIGHTING! ⚔️</span>
                </span>
              ) : status === "cooldown" ? (
                `Wait ${cooldownRemaining}s`
              ) : (
                "Fight"
              )}
            </button>
          </div>
        )}
        </div>

        {/* Quick Battle Shortcuts (.try) */}
        {selectedPlatform === "github" ? (
          <div className="try">
            <span className="mono">One click</span>
            <Link
              href="/battle/gh-torvalds-vs-antirez-legendary"
              className="hover:text-punch transition-colors"
            >
              torvalds vs antirez
            </Link>
            <button
              type="button"
              onClick={() => {
                setU1("gaearon");
                setU2("yyx990803");
              }}
              className="hover:text-punch transition-colors"
            >
              gaearon vs yyx990803
            </button>
          </div>
        ) : selectedPlatform === "codechef" ? (
          <div className="try">
            <span className="mono">One click</span>
            <Link
              href="/battle/cc-akulsareen-vs-gennady-legendary"
              className="hover:text-punch transition-colors"
            >
              akulsareen vs gennady
            </Link>
            <button
              type="button"
              onClick={() => {
                setU1("akulsareen");
                setU2("gennady");
              }}
              className="hover:text-punch transition-colors"
            >
              5★ vs 7★ Showdown
            </button>
          </div>
        ) : selectedPlatform === "leetcode" ? (
          <div className="try">
            <span className="mono">One click</span>
            <Link
              href="/battle/lc-neetcode-vs-larryny-legendary"
              className="hover:text-punch transition-colors"
            >
              neetcode vs larryny
            </Link>
            <button
              type="button"
              onClick={() => {
                setU1("lee215");
                setU2("StefanPochmann");
              }}
              className="hover:text-punch transition-colors"
            >
              lee215 vs StefanPochmann
            </button>
          </div>
        ) : (
          <div className="try">
            <span className="mono">One click</span>
            <Link
              href="/battle/cf-tourist-vs-petr-legendary"
              className="hover:text-punch transition-colors"
            >
              tourist vs Petr
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedPlatform("codeforces");
                setU1("ecnerwala");
                setU2("Benq");
              }}
              className="hover:text-punch transition-colors"
            >
              ecnerwala vs Benq
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPlatform("codeforces");
                setU1("Radewoosh");
                setU2("Um_nik");
              }}
              className="hover:text-punch transition-colors"
            >
              Radewoosh vs Um_nik
            </button>
          </div>
        )}

        {/* Status / Cooldown Feedback */}
        {isBattleEnabled(selectedPlatform) && (
          <MatchStatus
            state={status}
            error={errorMessage}
            cooldownSeconds={cooldownRemaining}
          />
        )}
      </form>
    </div>
  );
}
