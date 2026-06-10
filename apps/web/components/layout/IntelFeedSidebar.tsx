"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { IntelEvent } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

function FeedItem({ event, onSelect }: { event: IntelEvent; onSelect: (e: IntelEvent) => void }) {
  const color = CATEGORY_COLORS[event.category] ?? "#7a9ab8";
  const label = CATEGORY_LABELS[event.category] ?? event.category.toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(event.published_at), { addSuffix: false });

  return (
    <button
      onClick={() => onSelect(event)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
        borderBottom: "1px solid rgba(26,37,53,0.6)",
        background: "transparent",
        border: "none",
        borderBottomColor: "rgba(26,37,53,0.6)",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        cursor: "pointer",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-glow)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
          marginTop: "5px",
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: "11px",
            color: "var(--text)",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            color: "var(--text-dim)",
            marginTop: "4px",
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <span style={{ color }}>{label}</span>
          <span>·</span>
          <span>{event.district}</span>
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </button>
  );
}

export default function IntelFeedSidebar() {
  const { events, selectEvent } = useAppStore();
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        background: "var(--panel)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            letterSpacing: "0.18em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
          }}
        >
          Intel Feed
        </span>
        <span
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            color: "var(--accent)",
            letterSpacing: "0.08em",
          }}
        >
          {events.length}
        </span>
      </div>

      {/* Feed list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "thin" as const,
          scrollbarColor: "var(--border2) transparent",
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              padding: "24px 14px",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "10px",
              color: "var(--text-dim)",
              textAlign: "center",
              lineHeight: 2,
            }}
          >
            AWAITING SIGNAL...
          </div>
        ) : (
          events.map((event) => (
            <FeedItem key={event.id} event={event} onSelect={selectEvent} />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--border)",
          fontFamily: "Share Tech Mono, monospace",
          fontSize: "9px",
          color: "var(--text-dim)",
          flexShrink: 0,
          letterSpacing: "0.1em",
        }}
      >
        24H LOOKBACK WINDOW
      </div>
    </aside>
  );
}
