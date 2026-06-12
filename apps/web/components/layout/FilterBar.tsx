"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ALL_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import type { EventCategory } from "@/lib/types";

export default function FilterBar() {
  const { filters, setFilters } = useAppStore();
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");

  const handleSearch = () => {
    setFilters({ ...filters, searchQuery: searchInput.trim() });
  };

  const toggleCategory = (cat: string) => {
    const current = new Set(filters.categories);
    if (current.has(cat as EventCategory)) {
      current.delete(cat as EventCategory);
    } else {
      current.add(cat as EventCategory);
    }
    setFilters({ ...filters, categories: Array.from(current) });
  };

  const clearAll = () => {
    setFilters({ categories: [], searchQuery: "", districts: [] });
    setSearchInput("");
  };

  const activeCount = filters.categories.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "Barlow Condensed, sans-serif",
        fontSize: "13px",
        letterSpacing: "0.04em",
        color: "var(--text)",
      }}
    >
      {/* Search input */}
      <input
        type="text"
        placeholder="Search events..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "6px 10px",
          borderRadius: "4px",
          width: "220px",
          outline: "none",
        }}
      />

      {/* Category filter chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = filters.categories.includes(cat as EventCategory);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                border: `1px solid ${isActive ? CATEGORY_COLORS[cat] : "var(--border)"}`,
                background: isActive ? CATEGORY_COLORS[cat] : "var(--bg)",
                color: isActive ? "#080c10" : "var(--text-dim)",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                transition: "all 0.2s",
              }}
              title={CATEGORY_LABELS[cat]}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Status / clear */}
      <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
        {activeCount > 0 && (
          <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>
            {activeCount} filter{activeCount > 1 ? "s" : ""} active
          </span>
        )}
        <button
          onClick={clearAll}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            padding: "4px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
            textTransform: "uppercase",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
