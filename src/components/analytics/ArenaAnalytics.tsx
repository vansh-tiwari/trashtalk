"use client";

import React from "react";
import { Analytics } from "@vercel/analytics/react";

export interface ArenaAnalyticsProps {
  gaId?: string;
}

export default function ArenaAnalytics({ gaId }: ArenaAnalyticsProps) {
  const resolvedGaId = gaId ?? process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <Analytics framework="next" />
      {resolvedGaId ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(resolvedGaId)}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${resolvedGaId.replace(/[^a-zA-Z0-9_-]/g, "")}', {
                  anonymize_ip: true,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}
