"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

// Timeline playback speeds
const PLAYBACK_SPEEDS = [
  { label: "1×", value: 1 },
  { label: "5×", value: 5 },
  { label: "10×", value: 10 },
];

export default function TimelineBar() {
  const { events, filters, setFilters } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  // Calculate date range from events
  const dateRange = useMemo(() => {
    if (events.length === 0) return null;
    const dates = events.map(e => new Date(e.published_at)).sort((a, b) => a.getTime() - b.getTime());
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }, [events]);

  // Initialize time range to full range
  useEffect(() => {
    if (dateRange && !timeRange.start) {
      setTimeRange(dateRange);
      setCurrentTime(dateRange.end);
    }
  }, [dateRange, timeRange.start]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying || !timeRange.start || !timeRange.end) return;

    const duration = (timeRange.end.getTime() - timeRange.start.getTime()) / playbackSpeed;
    const elapsed = (currentTime.getTime() - timeRange.start.getTime());
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentTime(new Date(currentTime.getTime() + 1000 * playbackSpeed));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentTime, playbackSpeed, timeRange]);

  // Filter events by current time
  const visibleEvents = useMemo(() => {
    if (!dateRange) return [];
    return events.filter(e => new Date(e.published_at) <= currentTime);
  }, [events, currentTime, dateRange]);

  // Update filters to show only events up to current time
  useEffect(() => {
    if (isPlaying || currentTime !== timeRange?.end) {
      // In a real implementation, we'd update the displayed events
      // For now, this is a placeholder for the time-based filtering
    }
  }, [currentTime, isPlaying, timeRange]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!timeRange.start || !timeRange.end) return;
    const progress = parseFloat(e.target.value);
    const timestamp = timeRange.start.getTime() + (timeRange.end.getTime() - timeRange.start.getTime()) * progress;
    setCurrentTime(new Date(timestamp));
  };

  const togglePlay = () => {
    if (!timeRange.start || !timeRange.end) return;
    if (currentTime >= timeRange.end) {
      setCurrentTime(timeRange.start);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const progress = dateRange ? 
    (currentTime.getTime() - dateRange.start.getTime()) / (dateRange.end.getTime() - dateRange.start.getTime()) 
    : 0;

  return (
    <div
      style={{
        height: "48px",
        background: "rgba(8,12,16,0.98)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "12px",
        fontFamily: "Share Tech Mono, monospace",
        fontSize: "11px",
        color: "var(--text)",
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        disabled={!dateRange}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: isPlaying ? "var(--green)" : "var(--text)",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: dateRange ? "pointer" : "not-allowed",
          fontSize: "10px",
          letterSpacing: "0.1em",
        }}
      >
        {isPlaying ? "❚❚ PAUSE" : "▶ PLAY"}
      </button>

      {/* Speed selector */}
      <div style={{ display: "flex", gap: "4px" }}>
        {PLAYBACK_SPEEDS.map(speed => (
          <button
            key={speed.value}
            onClick={() => setPlaybackSpeed(speed.value)}
            style={{
              background: playbackSpeed === speed.value ? "#00d4ff" : "transparent",
              color: playbackSpeed === speed.value ? "#080c10" : "var(--text-dim)",
              border: "1px solid var(--border)",
              padding: "2px 6px",
              borderRadius: "2px",
              cursor: "pointer",
              fontSize: "9px",
            }}
          >
            {speed.label}
          </button>
        ))}
      </div>

      {/* Timeline scrubber */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "var(--text-dim)", fontSize: "9px" }}>
          {dateRange ? formatTime(dateRange.start) : "--"}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleSeek}
          disabled={!dateRange}
          style={{
            flex: 1,
            height: "4px",
            background: "var(--border)",
            outline: "none",
            cursor: dateRange ? "pointer" : "not-allowed",
          }}
        />
        <span style={{ color: "var(--text-dim)", fontSize: "9px" }}>
          {dateRange ? formatTime(dateRange.end) : "--"}
        </span>
      </div>

      {/* Current time display */}
      <div style={{
        padding: "4px 8px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        minWidth: "120px",
        textAlign: "center",
      }}>
        {dateRange ? formatTime(currentTime) : "--"}
      </div>

      {/* Event count */}
      <div style={{
        padding: "4px 8px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        color: "var(--text-dim)",
      }}>
        {visibleEvents.length} / {events.length} events
      </div>
    </div>
  );
}
