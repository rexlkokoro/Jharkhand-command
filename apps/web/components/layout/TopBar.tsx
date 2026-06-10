"use client";

import { useAppStore } from "@/store/useAppStore";
import type { NavTab } from "@/lib/types";

const TABS: { id: NavTab; label: string }[] = [
  { id: "map", label: "MAP INTELLIGENCE" },
  { id: "analytics", label: "ANALYTICS" },
  { id: "search", label: "ENTITY SEARCH" },
  { id: "timeline", label: "TIMELINE" },
];

export default function TopBar() {
  const { activeTab, setActiveTab, isLive, setLive } = useAppStore();

  return (
    <header
      style={{
        height: "48px",
        background: "rgba(8,12,16,0.98)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 20px",
          borderRight: "1px solid var(--border)",
          height: "100%",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "1.5px solid var(--accent)",
            transform: "rotate(45deg)",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "4px",
              background: "var(--accent)",
              opacity: 0.7,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.2em",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          JH<span style={{ color: "var(--accent)" }}>//CMD</span>
        </span>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: "flex", height: "100%" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0 18px",
              height: "100%",
              border: "none",
              borderRight: "1px solid var(--border)",
              background: activeTab === tab.id ? "var(--accent-dim)" : "transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right — live indicator + system status */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        <button
          onClick={() => setLive(!isLive)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 16px",
            height: "100%",
            border: "none",
            borderLeft: "1px solid var(--border)",
            background: "transparent",
            color: isLive ? "var(--green)" : "var(--text-dim)",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "10px",
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isLive ? "var(--green)" : "var(--text-dim)",
              boxShadow: isLive ? "0 0 6px var(--green)" : "none",
              animation: isLive ? "blink 2s infinite" : "none",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {isLive ? "LIVE" : "PAUSED"}
        </button>

        <div
          style={{
            padding: "0 16px",
            borderLeft: "1px solid var(--border)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
            }}
          >
            JHARKHAND · 24 DISTRICTS
          </span>
        </div>
      </div>
    </header>
  );
}
