export const CATEGORY_COLORS: Record<string, string> = {
  crime: "#ff3b5c",
  politics: "#9966ff",
  accident: "#ff8800",
  infrastructure: "#00d4ff",
  protest: "#ffaa00",
  weather: "#00aaff",
  disaster: "#ff4455",
  economy: "#00ff88",
  education: "#44ddff",
  health: "#ff66aa",
  civic: "#aaddff",
};

export const CATEGORY_LABELS: Record<string, string> = {
  crime: "CRIME",
  politics: "POLITICS",
  accident: "ACCIDENT",
  infrastructure: "INFRA",
  protest: "PROTEST",
  weather: "WEATHER",
  disaster: "DISASTER",
  economy: "ECONOMY",
  education: "EDUCATION",
  health: "HEALTH",
  civic: "CIVIC",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

export const JHARKHAND_CENTER: [number, number] = [23.6102, 85.2799];
export const JHARKHAND_ZOOM = 7;

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export const DISTRICTS = [
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
  "Deoghar", "Giridih", "Dumka", "Chaibasa", "Palamu",
  "Garhwa", "Lohardaga", "Simdega", "Chatra", "Koderma",
  "Ramgarh", "Khunti", "Saraikela", "Godda", "Sahebganj",
  "Pakur", "Jamtara", "Latehar", "Gumla",
];
