"use client";

import dynamic from "next/dynamic";

const CommandLayout = dynamic(() => import("@/components/layout/CommandLayout"), {
  ssr: false,
});

export default function HomePage() {
  return <CommandLayout />;
}
