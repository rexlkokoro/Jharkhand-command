"use client";

export default function TimelineBar() {
  return (
    <div
      style={{
        height: "44px",
        background: "var(--panel)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "0",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Playback controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 16px",
          borderRight: "1px solid var(--border)",
          height: "100%",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "9px",
            color: "var(--text-dim)",
            letterSpacing: "0.15em",
          }}
        >
          TIMELINE
        </span>
        {["◀◀", "▶", "▶▶"].map((ctrl) => (
          <button
            key={ctrl}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            {ctrl}
          </button>
        ))}
      </div>

      {/* Scrubber track */}
      <div
        style={{
          flex: 1,
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "3px",
        }}
      >
        <div
          style={{
            height: "3px",
            background: "var(--border)",
            borderRadius: "2px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, var(--accent) 0%, transparent 100%)",
              borderRadius: "2px",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "8px",
            color: "var(--text-dim)",
          }}
        >
          <span>-24H</span>
          <span>-12H</span>
          <span>-6H</span>
          <span>NOW</span>
        </div>
      </div>

      {/* Speed selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "0 16px",
          borderLeft: "1px solid var(--border)",
          height: "100%",
          flexShrink: 0,
        }}
      >
        {["1×", "5×", "10×"].map((speed) => (
          <button
            key={speed}
            style={{
              background: speed === "1×" ? "var(--accent-dim)" : "transparent",
              border: "1px solid",
              borderColor: speed === "1×" ? "rgba(0,212,255,0.3)" : "var(--border)",
              color: speed === "1×" ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              padding: "3px 8px",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            {speed}
          </button>
        ))}
      </div>
    </div>
  );
}
