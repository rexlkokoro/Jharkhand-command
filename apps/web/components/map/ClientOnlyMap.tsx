"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SimpleMap = dynamic(() => import("./SimpleMap"), {
  ssr: false,
  loading: () => (
    <div 
      className="flex items-center justify-center h-full" 
      style={{ 
        background: "var(--bg)",
        color: "var(--text-dim)",
        fontFamily: "Share Tech Mono, monospace"
      }}
    >
      Loading map...
    </div>
  ),
});

export default function ClientOnlyMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className="flex items-center justify-center h-full" 
        style={{ 
          background: "var(--bg)",
          color: "var(--text-dim)",
          fontFamily: "Share Tech Mono, monospace"
        }}
      >
        Initializing map...
      </div>
    );
  }

  return <SimpleMap />;
}
