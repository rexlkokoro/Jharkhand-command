"use client";

import { useAppStore } from "@/store/useAppStore";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { EventCategory } from "@/lib/types";

export default function AnalyticsSidebar() {
  const { events } = useAppStore();

  const totalEvents = events.length;

  const byCat = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});

  const byDistrict = events.reduce<Record<string, number>>((acc, e) => {
    if (e.district) acc[e.district] = (acc[e.district] ?? 0) + 1;
    return acc;
  }, {});

  const hotZones = Object.entries(byDistrict)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCategories = Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6) as [EventCategory, number][];

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
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
          fontFamily: "Share Tech Mono, monospace",
          fontSize: "9px",
          letterSpacing: "0.18em",
          color: "var(--text-dim)",
          textTransform: "uppercase" as const,
          flexShrink: 0,
        }}
      >
        District Intelligence
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          background: "var(--border)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {[
          { label: "TOTAL", value: totalEvents, color: "var(--accent)" },
          {
            label: "CRIME",
            value: byCat["crime"] ?? 0,
            color: CATEGORY_COLORS.crime,
          },
          {
            label: "PROTEST",
            value: byCat["protest"] ?? 0,
            color: CATEGORY_COLORS.protest,
          },
          {
            label: "ACCIDENT",
            value: byCat["accident"] ?? 0,
            color: CATEGORY_COLORS.accident,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--panel)",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "8px",
                color: "var(--text-dim)",
                letterSpacing: "0.1em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            color: "var(--text-dim)",
            letterSpacing: "0.15em",
            marginBottom: "10px",
            textTransform: "uppercase" as const,
          }}
        >
          By Category
        </div>
        {topCategories.map(([cat, count]) => {
          const color = CATEGORY_COLORS[cat];
          const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
          return (
            <div key={cat} style={{ marginBottom: "7px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "var(--text-mid)",
                  marginBottom: "3px",
                }}
              >
                <span style={{ color }}>{CATEGORY_LABELS[cat]}</span>
                <span>{count}</span>
              </div>
              <div
                style={{
                  height: "2px",
                  background: "var(--border)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: color,
                    borderRadius: "1px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hot zones */}
      <div style={{ padding: "10px 14px", flex: 1, overflowY: "auto" as const }}>
        <div
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            color: "var(--text-dim)",
            letterSpacing: "0.15em",
            marginBottom: "10px",
            textTransform: "uppercase" as const,
          }}
        >
          Hot Zones
        </div>
        {hotZones.length === 0 ? (
          <div
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              color: "var(--text-dim)",
            }}
          >
            NO DATA
          </div>
        ) : (
          hotZones.map(([district, count], i) => (
            <div
              key={district}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid rgba(26,37,53,0.5)",
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "8px",
                    color: "var(--accent)",
                    minWidth: "12px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "11px",
                    color: "var(--text-mid)",
                  }}
                >
                  {district}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "10px",
                  color: "var(--text)",
                }}
              >
                {count}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
