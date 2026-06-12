"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { IntelEvent, EventCategory } from "@/lib/types";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  crime: "#ff0044",
  politics: "#ff6600",
  accident: "#ffaa00",
  infrastructure: "#ffdd00",
  protest: "#88ff00",
  weather: "#00ff88",
  disaster: "#00d4ff",
  economy: "#0088ff",
  education: "#0044ff",
  health: "#8800ff",
  civic: "#cc00ff",
};

export default function AnalyticsView() {
  const { events } = useAppStore();

  // Category distribution
  const categoryStats = useMemo(() => {
    const stats = new Map<EventCategory, number>();
    events.forEach(event => {
      stats.set(event.category, (stats.get(event.category) || 0) + 1);
    });
    return Array.from(stats.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / events.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // District heat table
  const districtStats = useMemo(() => {
    const stats = new Map<string, { count: number; sentiment: number[] }>();
    events.forEach(event => {
      if (event.district) {
        const existing = stats.get(event.district) || { count: 0, sentiment: [] };
        existing.count++;
        if (event.sentiment !== null && event.sentiment !== undefined) {
          existing.sentiment.push(event.sentiment);
        }
        stats.set(event.district, existing);
      }
    });
    return Array.from(stats.entries())
      .map(([district, data]) => ({
        district,
        count: data.count,
        avgSentiment: data.sentiment.length > 0 
          ? data.sentiment.reduce((a, b) => a + b, 0) / data.sentiment.length 
          : null,
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Overall sentiment
  const overallSentiment = useMemo(() => {
    const sentiments = events
      .map(e => e.sentiment)
      .filter(s => s !== null && s !== undefined);
    if (sentiments.length === 0) return null;
    return sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  }, [events]);

  // Time series (last 7 days)
  const timeSeries = useMemo(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return days.map(date => {
      const dayEvents = events.filter(e => 
        e.published_at.startsWith(date)
      );
      return {
        date,
        count: dayEvents.length,
        sentiment: dayEvents.length > 0
          ? dayEvents
              .map(e => e.sentiment)
              .filter(s => s !== null && s !== undefined)
              .reduce((a, b, _, arr) => a + b / arr.length, 0)
          : null,
      };
    });
  }, [events]);

  const getSentimentColor = (sentiment: number | null) => {
    if (sentiment === null) return "var(--text-dim)";
    if (sentiment > 0.25) return "var(--green)";
    if (sentiment < -0.25) return "#ff0044";
    return "#ffaa00";
  };

  const getSentimentLabel = (sentiment: number | null) => {
    if (sentiment === null) return "N/A";
    if (sentiment > 0.25) return "Positive";
    if (sentiment < -0.25) return "Negative";
    return "Neutral";
  };

  return (
    <div
      style={{
        padding: "20px",
        height: "100%",
        overflow: "auto",
        fontFamily: "Share Tech Mono, monospace",
        fontSize: "12px",
        color: "var(--text)",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "20px",
          color: "#00d4ff",
          letterSpacing: "0.1em",
        }}
      >
        ANALYTICS DASHBOARD
      </h2>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <div style={{ color: "var(--text-dim)", fontSize: "10px", marginBottom: "4px" }}>
            TOTAL EVENTS
          </div>
          <div style={{ fontSize: "24px", color: "#00d4ff" }}>
            {events.length}
          </div>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <div style={{ color: "var(--text-dim)", fontSize: "10px", marginBottom: "4px" }}>
            AVG SENTIMENT
          </div>
          <div style={{ fontSize: "24px", color: getSentimentColor(overallSentiment) }}>
            {overallSentiment !== null ? overallSentiment.toFixed(2) : "N/A"}
          </div>
          <div style={{ fontSize: "9px", color: getSentimentColor(overallSentiment) }}>
            {getSentimentLabel(overallSentiment)}
          </div>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <div style={{ color: "var(--text-dim)", fontSize: "10px", marginBottom: "4px" }}>
            ACTIVE DISTRICTS
          </div>
          <div style={{ fontSize: "24px", color: "#ff6600" }}>
            {districtStats.length}
          </div>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <div style={{ color: "var(--text-dim)", fontSize: "10px", marginBottom: "4px" }}>
            TOP CATEGORY
          </div>
          <div style={{ fontSize: "16px", color: CATEGORY_COLORS[categoryStats[0]?.category] || "var(--text)" }}>
            {categoryStats[0]?.category.toUpperCase() || "N/A"}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            marginBottom: "12px",
            color: "var(--text)",
            letterSpacing: "0.05em",
          }}
        >
          CATEGORY DISTRIBUTION
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {categoryStats.map(({ category, count, percentage }) => (
            <div key={category} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: CATEGORY_COLORS[category],
                  borderRadius: "2px",
                }}
              />
              <span style={{ flex: 1, textTransform: "uppercase" }}>{category}</span>
              <span style={{ color: "var(--text-dim)" }}>{count}</span>
              <span style={{ color: "var(--text-dim)" }}>{percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* District Heat Table */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            marginBottom: "12px",
            color: "var(--text)",
            letterSpacing: "0.05em",
          }}
        >
          DISTRICT HEAT MAP
        </h3>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px", fontSize: "10px", color: "var(--text-dim)" }}>
                  DISTRICT
                </th>
                <th style={{ textAlign: "right", padding: "8px", fontSize: "10px", color: "var(--text-dim)" }}>
                  EVENTS
                </th>
                <th style={{ textAlign: "right", padding: "8px", fontSize: "10px", color: "var(--text-dim)" }}>
                  SENTIMENT
                </th>
              </tr>
            </thead>
            <tbody>
              {districtStats.map(({ district, count, avgSentiment }, index) => (
                <tr
                  key={district}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: index % 2 === 0 ? "transparent" : "rgba(0, 212, 255, 0.05)",
                  }}
                >
                  <td style={{ padding: "8px", textTransform: "uppercase" }}>{district}</td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{count}</td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "8px",
                      color: getSentimentColor(avgSentiment),
                    }}
                  >
                    {avgSentiment !== null ? avgSentiment.toFixed(2) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Day Trend */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            marginBottom: "12px",
            color: "var(--text)",
            letterSpacing: "0.05em",
          }}
        >
          7-DAY TREND
        </h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "80px" }}>
          {timeSeries.map(({ date, count, sentiment }, index) => {
            const maxCount = Math.max(...timeSeries.map(d => d.count));
            const height = maxCount > 0 ? (count / maxCount) * 60 : 0;
            const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
            
            return (
              <div
                key={date}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${height}px`,
                    background: sentiment !== null 
                      ? getSentimentColor(sentiment)
                      : "var(--text-dim)",
                    borderRadius: "2px",
                    minHeight: "2px",
                  }}
                />
                <div style={{ fontSize: "9px", color: "var(--text-dim)" }}>
                  {dayName}
                </div>
                <div style={{ fontSize: "9px", color: "var(--text)" }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
