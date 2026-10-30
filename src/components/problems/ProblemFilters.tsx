"use client";

import React from "react";
import type { RatingFilter, ProblemSort } from "@/lib/problems/presentation";
import { Search, X } from "lucide-react";

export type RatingFilterOption = RatingFilter;
export type SortOption = ProblemSort;

export interface ProblemFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ratingFilter: RatingFilter;
  onRatingFilterChange: (filter: RatingFilter) => void;
  sortBy: ProblemSort;
  onSortChange: (sort: ProblemSort) => void;
  totalFiltered: number;
}

export default function ProblemFilters({
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  sortBy,
  onSortChange,
  totalFiltered,
}: ProblemFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== "" || ratingFilter !== "all" || sortBy !== "rating-desc";

  function handleReset() {
    onSearchChange("");
    onRatingFilterChange("all");
    onSortChange("rating-desc");
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="find a problem by name, ID, or #tag..."
          className="w-full pl-9 pr-8 py-2 rounded-control bg-canvas border border-rule text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand min-h-[44px]"
          aria-label="Filter problems by name, ID, or tag"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-ink min-h-[44px] min-w-[32px] justify-center"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Difficulty & Sort Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="rating-filter" className="sr-only">
          Difficulty Filter
        </label>
        <select
          id="rating-filter"
          value={ratingFilter}
          onChange={(e) => onRatingFilterChange(e.target.value as RatingFilter)}
          className="px-3 py-2 rounded-control bg-canvas border border-rule text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand min-h-[44px]"
        >
          <option value="all">All Difficulties</option>
          <option value="master">★ 2200+ (Master)</option>
          <option value="hard">★ 1600–2199 (Hard)</option>
          <option value="easy">★ &lt; 1600 (Easy)</option>
          <option value="unrated">Unrated</option>
        </select>

        <label htmlFor="sort-by" className="sr-only">
          Sort by
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as ProblemSort)}
          className="px-3 py-2 rounded-control bg-canvas border border-rule text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand min-h-[44px]"
        >
          <option value="rating-desc">Hardest first</option>
          <option value="rating-asc">Easiest first</option>
          <option value="name-asc">Name: A to Z</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-2 text-xs text-muted hover:text-ink underline whitespace-nowrap min-h-[44px]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
