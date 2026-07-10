export const fontFamilies = [
  { id: "modern", name: "Modern", className: "font-body", family: "var(--font-body), system-ui, sans-serif", preview: "The quick brown fox" },
  { id: "sora", name: "Sora", className: "font-heading", family: "var(--font-heading), Georgia, serif", preview: "The quick brown fox" },
  { id: "system", name: "System", className: "", family: "system-ui, -apple-system, sans-serif", preview: "The quick brown fox" },
  { id: "serif", name: "Serif", className: "", family: "Georgia, 'Times New Roman', serif", preview: "The quick brown fox" },
  { id: "mono", name: "Monospace", className: "", family: "'Courier New', Consolas, monospace", preview: "The quick brown fox" },
] as const

export const fontSizeOptions = [
  { id: "sm", name: "Small", className: "text-sm", px: 14 },
  { id: "md", name: "Medium", className: "text-base", px: 16 },
  { id: "lg", name: "Large", className: "text-lg", px: 18 },
  { id: "xl", name: "Extra Large", className: "text-xl", px: 20 },
] as const

export const borderWidthOptions = [
  { id: "none", name: "None", className: "border-0" },
  { id: "thin", name: "Thin", className: "border" },
  { id: "medium", name: "Medium", className: "border-2" },
  { id: "thick", name: "Thick", className: "border-4" },
] as const

export const shadowOptions = [
  { id: "none", name: "None", className: "shadow-none" },
  { id: "subtle", name: "Subtle", className: "shadow-sm" },
  { id: "medium", name: "Medium", className: "shadow-md" },
  { id: "large", name: "Large", className: "shadow-lg" },
] as const

export const spacingOptions = [
  { id: "compact", name: "Compact", className: "gap-2" },
  { id: "normal", name: "Normal", className: "gap-3" },
  { id: "comfortable", name: "Comfortable", className: "gap-4" },
  { id: "spacious", name: "Spacious", className: "gap-6" },
] as const

export const layoutModes = [
  { id: "list", name: "List", className: "flex flex-col", icon: "list" },
  { id: "grid", name: "Grid", className: "grid grid-cols-2", icon: "grid" },
] as const

export const hoverEffects = [
  { id: "none", name: "None", className: "", description: "No animation" },
  { id: "lift", name: "Lift", className: "hover:-translate-y-1 hover:shadow-lg", description: "Rises up on hover" },
  { id: "glow", name: "Glow", className: "hover:scale-[1.02]", description: "Subtle glow effect" },
  { id: "scale", name: "Scale", className: "hover:scale-105", description: "Grows slightly" },
  { id: "slide", name: "Slide", className: "hover:translate-x-1", description: "Slides to the right" },
] as const

export const fontWeightOptions = [
  { id: "light", name: "Light", className: "font-light", weight: 300 },
  { id: "normal", name: "Normal", className: "font-normal", weight: 400 },
  { id: "medium", name: "Medium", className: "font-medium", weight: 500 },
  { id: "semibold", name: "Semibold", className: "font-semibold", weight: 600 },
  { id: "bold", name: "Bold", className: "font-bold", weight: 700 },
] as const

export const colorHarmonies: Record<string, string[]> = {
  "#c04a2b": ["#2b6cc0", "#4ac02b", "#c02b8a", "#c08a2b"],
  "#d46845": ["#4588d4", "#68d445", "#d445a8", "#d4a845"],
  "#e8926e": ["#6e92e8", "#92e86e", "#e86eb2", "#e8c86e"],
  "#ef4444": ["#4444ef", "#44ef44", "#ef44a8", "#efaa44"],
  "#f97316": ["#1673f9", "#73f916", "#f916a8", "#f9c816"],
  "#eab308": ["#08b3ea", "#b3ea08", "#ea08b8", "#ea6808"],
  "#22c55e": ["#c55e22", "#5ec522", "#22c5c5", "#2265c5"],
  "#14b8a6": ["#b8a614", "#a614b8", "#14b858", "#1468b8"],
  "#06b6d4": ["#d4b606", "#b606d4", "#06d486", "#0656d4"],
  "#3b82f6": ["#f6823b", "#82f63b", "#3bf6f6", "#3b56f6"],
  "#6b7280": ["#72806b", "#806b72", "#6b7272", "#6b6b80"],
  "#000000": ["#333333", "#666666", "#999999", "#cccccc"],
}

export const quickStylePresets = [
  {
    id: "clean-minimal",
    name: "Clean & Minimal",
    description: "Simple, elegant, and focused on your content",
    theme: "default",
    accentColor: "#3b82f6",
    buttonStyle: "rounded",
    hoverEffect: "lift",
    layoutMode: "list",
    linkBorderWidth: "none",
    linkShadow: "none",
    linkSpacing: "normal",
    fontFamily: "modern",
    fontSize: "md",
    previewGradient: "from-slate-50 to-white",
    previewAccent: "bg-blue-500",
  },
  {
    id: "bold-dark",
    name: "Bold & Dark",
    description: "Make a statement with dark mode and bold colors",
    theme: "dark",
    accentColor: "#ef4444",
    buttonStyle: "pill",
    hoverEffect: "glow",
    layoutMode: "list",
    linkBorderWidth: "none",
    linkShadow: "medium",
    linkSpacing: "normal",
    fontFamily: "modern",
    fontSize: "lg",
    previewGradient: "from-neutral-900 to-neutral-800",
    previewAccent: "bg-red-500",
  },
  {
    id: "warm-sunset",
    name: "Warm Sunset",
    description: "Warm, inviting colors that feel like golden hour",
    theme: "sunset",
    accentColor: "#f97316",
    buttonStyle: "pill",
    hoverEffect: "scale",
    layoutMode: "list",
    linkBorderWidth: "thin",
    linkShadow: "subtle",
    linkSpacing: "comfortable",
    fontFamily: "modern",
    fontSize: "md",
    previewGradient: "from-orange-100 to-rose-100",
    previewAccent: "bg-orange-500",
  },
  {
    id: "fresh-mint",
    name: "Fresh Mint",
    description: "Cool, refreshing tones for a modern vibe",
    theme: "mint",
    accentColor: "#14b8a6",
    buttonStyle: "rounded",
    hoverEffect: "slide",
    layoutMode: "list",
    linkBorderWidth: "none",
    linkShadow: "subtle",
    linkSpacing: "normal",
    fontFamily: "modern",
    fontSize: "md",
    previewGradient: "from-emerald-100 to-teal-100",
    previewAccent: "bg-teal-500",
  },
  {
    id: "elegant-lavender",
    name: "Elegant Lavender",
    description: "Sophisticated purple tones with refined styling",
    theme: "lavender",
    accentColor: "#8b5cf6",
    buttonStyle: "rounded",
    hoverEffect: "lift",
    layoutMode: "list",
    linkBorderWidth: "thin",
    linkShadow: "medium",
    linkSpacing: "comfortable",
    fontFamily: "serif",
    fontSize: "md",
    previewGradient: "from-violet-100 to-purple-100",
    previewAccent: "bg-violet-500",
    isPro: true,
  },
  {
    id: "neon-night",
    name: "Neon Night",
    description: "Cyberpunk-inspired with neon accents on dark",
    theme: "midnight",
    accentColor: "#06b6d4",
    buttonStyle: "square",
    hoverEffect: "scale",
    layoutMode: "grid",
    linkBorderWidth: "thin",
    linkShadow: "large",
    linkSpacing: "normal",
    fontFamily: "mono",
    fontSize: "sm",
    previewGradient: "from-indigo-950 to-slate-900",
    previewAccent: "bg-cyan-500",
    isPro: true,
  },
] as const

export const emojis = [
  "🔥", "💫", "⭐", "✨", "🎯", "💎", "🚀", "💡", "🎨", "📸",
  "🎵", "🎬", "📺", "🎮", "⚽", "🏀", "🎧", "📚", "✍️", "💪",
  "🤝", "💬", "📢", "🛒", "💰", "🎁", "🏆", "🌟", "🔗", "📱",
  "💻", "🖥️", "⌚", "📷", "🎥", "🎙️", "📡", "🔔", "📌", "📍",
  "❤️", "💙", "💚", "💛", "💜", "🧡", "🖤", "🤍", "💝", "💖",
  "🌈", "☀️", "🌙", "🌟", "🌊", "🔥", "🌸", "🍀", "🌺", "🎭",
  "🍕", "🍔", "☕", "🍻", "🎂", "🍿", "🏖️", "✈️", "🚗", "🏠",
  "👋", "👍", "👏", "🙌", "💅", "🫶", "👀", "🧠", "👑", "💄",
] as const
