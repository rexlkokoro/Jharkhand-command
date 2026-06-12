"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { IntelEvent } from "@/lib/types";

const ENTITY_COLORS: Record<string, string> = {
  PERSON: "#ff6600",
  LOCATION: "#00d4ff",
  ORG: "#88ff00",
  DATE: "#ffaa00",
  EVENT: "#cc00ff",
};

export default function EntitySearchView() {
  const { events } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Extract all entities from events
  const allEntities = useMemo(() => {
    const entityMap = new Map<string, { type: string; count: number; events: string[] }>();
    
    events.forEach(event => {
      event.entities?.forEach(entity => {
        const key = `${entity.entity_text}:${entity.entity_type}`;
        const existing = entityMap.get(key) || { type: entity.entity_type, count: 0, events: [] };
        existing.count++;
        existing.events.push(event.id);
        entityMap.set(key, existing);
      });
    });
    
    return Array.from(entityMap.entries()).map(([key, data]) => {
      const [text, type] = key.split(':');
      return { text, type, ...data };
    });
  }, [events]);

  // Filter entities based on search and type
  const filteredEntities = useMemo(() => {
    return allEntities.filter(entity => {
      const matchesSearch = searchQuery === "" || 
        entity.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "ALL" || entity.type === selectedType;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.count - a.count);
  }, [allEntities, searchQuery, selectedType]);

  // Get events for selected entity
  const relatedEvents = useMemo(() => {
    if (!selectedEntity) return [];
    const [text, type] = selectedEntity.split(':');
    return events.filter(event =>
      event.entities?.some(entity => entity.entity_text === text && entity.entity_type === type)
    );
  }, [selectedEntity, events]);

  const entityTypes = useMemo(() => {
    const types = new Set(allEntities.map(e => e.type));
    return ["ALL", ...Array.from(types)];
  }, [allEntities]);

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
        ENTITY SEARCH
      </h2>

      {/* Search and Filter */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search entities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          {entityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Entity List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              color: "var(--text)",
              letterSpacing: "0.05em",
            }}
          >
            ENTITIES ({filteredEntities.length})
          </h3>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            {filteredEntities.map((entity, index) => (
              <div
                key={`${entity.text}:${entity.type}`}
                onClick={() => setSelectedEntity(`${entity.text}:${entity.type}`)}
                style={{
                  padding: "10px 12px",
                  borderBottom: index < filteredEntities.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  background: selectedEntity === `${entity.text}:${entity.type}` 
                    ? "rgba(0, 212, 255, 0.1)" 
                    : "transparent",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedEntity !== `${entity.text}:${entity.type}`) {
                    e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEntity !== `${entity.text}:${entity.type}`) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: ENTITY_COLORS[entity.type] || "var(--text-dim)",
                      borderRadius: "2px",
                    }}
                  />
                  <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    {entity.text}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: ENTITY_COLORS[entity.type] || "var(--text-dim)",
                      padding: "2px 4px",
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "2px",
                    }}
                  >
                    {entity.type}
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                  {entity.count} event{entity.count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
            {filteredEntities.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-dim)" }}>
                No entities found
              </div>
            )}
          </div>
        </div>

        {/* Related Events */}
        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              color: "var(--text)",
              letterSpacing: "0.05em",
            }}
          >
            RELATED EVENTS {selectedEntity && `(${relatedEvents.length})`}
          </h3>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            {selectedEntity ? (
              relatedEvents.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    padding: "12px",
                    borderBottom: index < relatedEvents.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#00d4ff",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {event.category}
                  </div>
                  <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                    {event.title}
                  </div>
                  {event.summary && (
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "4px" }}>
                      {event.summary}
                    </div>
                  )}
                  <div style={{ fontSize: "9px", color: "var(--text-dim)" }}>
                    {new Date(event.published_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-dim)" }}>
                Select an entity to view related events
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entity Type Legend */}
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "8px" }}>
          ENTITY TYPES
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {Object.entries(ENTITY_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: color,
                  borderRadius: "2px",
                }}
              />
              <span style={{ fontSize: "10px", textTransform: "uppercase" }}>
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
