import React from "react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4 max-w-md mx-auto text-center"
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#304BFF]/20 border-t-[#304BFF] animate-spin" />
      <span className="text-xs text-secondary font-medium">loading...</span>
    </div>
  );
}
