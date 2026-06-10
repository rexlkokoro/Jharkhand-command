"use client";

import { useEffect } from "react";
import TopBar from "./TopBar";
import IntelFeedSidebar from "./IntelFeedSidebar";
import AnalyticsSidebar from "./AnalyticsSidebar";
import TimelineBar from "./TimelineBar";
import EventDetailDrawer from "../panels/EventDetailDrawer";
import MapView from "../map/MapView";
import { useAppStore } from "@/store/useAppStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fetchEvents } from "@/lib/api";

export default function CommandLayout() {
  const { activeTab, isDrawerOpen, setEvents } = useAppStore();

  useWebSocket();

  useEffect(() => {
    fetchEvents({ limit: 100 })
      .then((res) => setEvents(res.events))
      .catch(() => {});
  }, [setEvents]);

  return (
    <div
      className="relative flex flex-col"
      style={{ height: "100dvh", background: "var(--bg)", overflow: "hidden" }}
    >
      {/* Top navigation bar */}
      <TopBar />

      {/* Main body: sidebar + map + analytics panel */}
      <div className="flex flex-1 overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
        {/* Left — Intel Feed */}
        <IntelFeedSidebar />

        {/* Center — Primary view */}
        <main className="flex-1 relative overflow-hidden">
          {activeTab === "map" && <MapView />}
          {activeTab === "analytics" && (
            <div className="flex items-center justify-center h-full font-mono text-sm" style={{ color: "var(--text-dim)" }}>
              <span>ANALYTICS VIEW — Phase 5</span>
            </div>
          )}
          {activeTab === "search" && (
            <div className="flex items-center justify-center h-full font-mono text-sm" style={{ color: "var(--text-dim)" }}>
              <span>ENTITY SEARCH — Phase 5</span>
            </div>
          )}
          {activeTab === "timeline" && (
            <div className="flex items-center justify-center h-full font-mono text-sm" style={{ color: "var(--text-dim)" }}>
              <span>TIMELINE VIEW — Phase 5</span>
            </div>
          )}
        </main>

        {/* Right — Analytics Panel */}
        <AnalyticsSidebar />
      </div>

      {/* Bottom — Timeline scrubber */}
      <TimelineBar />

      {/* Overlay — Event detail drawer */}
      {isDrawerOpen && <EventDetailDrawer />}
    </div>
  );
}
