"use client";

import { useAppStore } from "@/store/useAppStore";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";

export default function EventDetailDrawer() {
  const { selectedEvent, setDrawerOpen, selectEvent } = useAppStore();

  if (!selectedEvent) return null;

  const color = CATEGORY_COLORS[selectedEvent.category] ?? "#7a9ab8";
  const label = CATEGORY_LABELS[selectedEvent.category] ?? selectedEvent.category.toUpperCase();
  const publishedAt = new Date(selectedEvent.published_at).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sentimentColor =
    selectedEvent.sentiment > 0.2
      ? "var(--green)"
      : selectedEvent.sentiment < -0.2
      ? "var(--red)"
      : "var(--amber)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => selectEvent(null)}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 200,
          background: "transparent",
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "360px",
          zIndex: 201,
          background: "var(--panel)",
          borderLeft: "1px solid var(--border2)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
          animation: "fade-up 0.2s ease forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color,
                  letterSpacing: "0.15em",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                }}
              >
                · {selectedEvent.district}
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "17px",
                color: "#fff",
                lineHeight: 1.3,
                letterSpacing: "0.02em",
              }}
            >
              {selectedEvent.title}
            </h2>
          </div>
          <button
            onClick={() => selectEvent(null)}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              width: "26px",
              height: "26px",
              cursor: "pointer",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "12px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* AI Summary */}
          {selectedEvent.summary && (
            <div>
              <div
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                  textTransform: "uppercase" as const,
                }}
              >
                AI Summary
              </div>
              <p
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "13px",
                  color: "var(--text-mid)",
                  lineHeight: 1.7,
                  background: "rgba(0,212,255,0.04)",
                  border: "1px solid var(--border)",
                  padding: "10px 14px",
                  borderLeft: "3px solid var(--accent)",
                }}
              >
                {selectedEvent.summary}
              </p>
            </div>
          )}

          {/* Metrics row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "var(--border)" }}>
            {[
              {
                label: "CONFIDENCE",
                value: `${Math.round(selectedEvent.confidence * 100)}%`,
                color: selectedEvent.confidence > 0.7 ? "var(--green)" : "var(--amber)",
              },
              {
                label: "SENTIMENT",
                value: selectedEvent.sentiment.toFixed(2),
                color: sentimentColor,
              },
              {
                label: "SOURCE",
                value: selectedEvent.source_name || "UNKNOWN",
                color: "var(--accent)",
              },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "var(--bg2)",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "8px",
                    color: "var(--text-dim)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: m.color,
                    lineHeight: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Location */}
          <div>
            <div
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "9px",
                color: "var(--text-dim)",
                letterSpacing: "0.15em",
                marginBottom: "6px",
                textTransform: "uppercase" as const,
              }}
            >
              Location
            </div>
            <div
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "11px",
                color: "var(--text)",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{selectedEvent.location_name}</span>
              {selectedEvent.geom && (
                <span style={{ color: "var(--text-dim)" }}>
                  {selectedEvent.geom.coordinates[1].toFixed(4)}, {selectedEvent.geom.coordinates[0].toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Entities */}
          {selectedEvent.entities && selectedEvent.entities.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                  textTransform: "uppercase" as const,
                }}
              >
                Extracted Entities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedEvent.entities.map((entity) => (
                  <span
                    key={entity.id}
                    style={{
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: "9px",
                      padding: "3px 8px",
                      border: "1px solid var(--border2)",
                      color: "var(--text-mid)",
                      background: "var(--bg2)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {entity.entity_type}: {entity.normalized || entity.entity_text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              color: "var(--text-dim)",
              paddingTop: "8px",
              borderTop: "1px solid var(--border)",
            }}
          >
            PUBLISHED: {publishedAt}
          </div>
        </div>

        {/* Footer — source link */}
        {selectedEvent.source_url && (
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <a
              href={selectedEvent.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "9px",
                color: "var(--accent)",
                letterSpacing: "0.12em",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              VIEW SOURCE ARTICLE →
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
