import dynamic from "next/dynamic";

const CommandLayout = dynamic(() => import("@/components/layout/CommandLayout"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
      <div style={{ color: "var(--text)", fontFamily: "Share Tech Mono, monospace" }}>
        Loading Jharkhand COMMAND...
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <CommandLayout />;
}
