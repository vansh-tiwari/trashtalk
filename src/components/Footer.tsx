import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ft2 w-full mt-auto select-none">
      <div className="w">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 text-sm">
          <Link href="/" className="lg text-white no-underline">
            TrashTalk<sup className="text-punch">2.0</sup>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/70 text-xs sm:text-sm">
            <span>Rebuilt from a 2020 college project · Live &amp; sample receipts</span>
            <span aria-hidden="true">·</span>
            <Link href="/evolution" className="hover:text-white transition-colors">
              The lore
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/vansh-tiwari/trashtalk/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>Report a bug</span>
              <span aria-hidden="true" className="text-xs">↗</span>
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/vansh-tiwari/trashtalk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <span aria-hidden="true" className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
