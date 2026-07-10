"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Crown,
  Lock,
  Check,
  Sparkles,
  Type,
  AlignLeft,
  Square,
  LayoutGrid,
  Image,
  Eye,
  Box,
  Mail,
  Code,
  Clock,
  Search,
  Heart,
  Palette,
  Layers,
  MousePointer,
  Smartphone,
  RotateCcw,
  Save,
  Loader2,
  Undo2,
  Share2,
  CheckCheck,
  Zap,
  RefreshCw,
  Shuffle,
} from "lucide-react";
import { themes, proThemes, buttonStyles, avatarShapes, alignmentOptions } from "@/lib/themes";
import {
  fontFamilies,
  fontSizeOptions,
  borderWidthOptions,
  shadowOptions,
  spacingOptions,
  layoutModes,
  hoverEffects,
  fontWeightOptions,
  colorHarmonies,
} from "@/lib/customization";
import { templates } from "@/lib/templates";
import type { Template } from "@/lib/templates";
import { ProfilePreview } from "@/components/dashboard/profile-preview";
import type { LinkData, SocialLinkData, ProductData, EmbedData, PageData, IntegrationData } from "@/components/public-page/public-profile";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

const presetColors = [
  "#c04a2b", "#d46845", "#e8926e", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6b7280", "#000000",
];

const bgPresetColors = [
  "#ffffff", "#f3f4f6", "#fef3c7", "#ede9fe",
  "#dbeafe", "#fce7f3", "#ecfdf5", "#1e1b4b",
  "#0f172a", "#1c1917",
];

const borderPresetColors = [
  "#ffffff", "#e5e7eb", "#9ca3af", "#374151",
  "#000000",
];

const textPresetColors = [
  "#ffffff", "#000000", "#1e293b", "#f8fafc", "#fef2f2", "#ecfdf5",
];

const tabs = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "buttons", label: "Buttons", icon: Square },
  { id: "typography", label: "Typography", icon: Type },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "advanced", label: "Advanced", icon: Code },
] as const;

const defaultSettings = {
  accentColor: "#c04a2b",
  theme: "default",
  showBranding: true,
  buttonStyle: "rounded",
  bioAlignment: "center",
  buttonTextColor: "#ffffff",
  backgroundColor: "",
  avatarShape: "circle",
  fontFamily: "modern",
  fontSize: "md",
  linkBorderWidth: "none",
  linkShadow: "none",
  linkSpacing: "normal",
  layoutMode: "list",
  hoverEffect: "lift",
  showAvatar: true,
  showBio: true,
  headerImageUrl: "",
  customCss: "",
  isLocked: false,
  pagePassword: "",
  buttonBorderColor: "",
  buttonFontWeight: "medium",
  countdownTitle: "",
  countdownDate: "",
  enableEmailCapture: false,
  emailCaptureTitle: "",
  metaTitle: "",
  metaDescription: "",
  ogImageUrl: "",
  tipEnabled: false,
  tipVenmo: "",
  tipPayPal: "",
  tipCashApp: "",
};

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded-full">
      <Crown className="w-3 h-3" /> Pro
    </span>
  );
}

function ProLock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-neutral-900/40 rounded-xl z-10">
      <div className="text-center p-4">
        <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Upgrade to Pro</p>
        <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Unlock this feature</p>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange, presets, label, showClear = true, className }: {
  value: string;
  onChange: (color: string) => void;
  presets: string[];
  label?: string;
  showClear?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</Label>}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative" style={{ backgroundColor: value || "#ffffff" }}>
          {value && (
            <span className="text-[10px] font-bold opacity-80" style={{ color: isLightColor(value) ? "#000" : "#fff" }}>
              {value.replace("#", "").toUpperCase()}
            </span>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="w-28 font-mono text-xs"
        />
        {showClear && value && (
          <button onClick={() => onChange("")} className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              value === color ? "border-neutral-900 dark:border-white scale-110" : "border-neutral-200 dark:border-neutral-700"
            )}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Color ${color}`}
            aria-pressed={value === color}
          />
        ))}
      </div>
    </div>
  );
}

function OptionGrid<T extends { id: string; name: string; className?: string }>({
  options,
  value,
  onChange,
  disabled = false,
  isPro = false,
  proItems = [],
  renderOption,
}: {
  options: T[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  isPro?: boolean;
  proItems?: string[];
  renderOption?: (option: T, isSelected: boolean, isProItem: boolean) => React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-3", disabled && "opacity-60 pointer-events-none select-none")}>
      {options.map((opt) => {
        const isProItem = proItems.includes(opt.id);
        const isSelected = value === opt.id && !isProItem;
        return (
          <button
            key={opt.id}
            onClick={() => !isProItem && onChange(opt.id)}
            disabled={disabled || isProItem}
            className={cn(
              "flex items-center justify-center text-sm font-medium border-2 rounded-xl transition-all",
              isSelected
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100",
              isProItem && "relative"
            )}
            style={{ fontFamily: opt.className }}
          >
            {renderOption ? (
              renderOption(opt, isSelected, isProItem)
            ) : (
              <>
                {opt.name}
                {isProItem && <ProBadge />}
              </>
            )}
            {isProItem && <ProLock />}
          </button>
        );
      })}
      {isPro && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
          {proItems.length} additional options available on the Pro plan.
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, description, icon, children, className, pro = false }: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pro?: boolean;
}) {
  return (
    <Card className={cn("relative", pro && "opacity-60 pointer-events-none select-none", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {icon && <span className="text-brand-600 dark:text-brand-400">{icon}</span>}
          {title}
          {pro && <ProBadge />}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
      {pro && <ProLock />}
    </Card>
  );
}

function ButtonPreview({ style, color, textColor, borderColor, fontWeight, fontFamily }: {
  style: string;
  color: string;
  textColor?: string;
  borderColor?: string;
  fontWeight?: string;
  fontFamily?: string;
}) {
  const roundedClass = buttonStyles.find(s => s.id === style)?.className || "rounded-xl";
  const weightClass = fontWeightOptions.find(w => w.id === fontWeight)?.className || "font-medium";
  const font = fontFamilies.find(f => f.id === fontFamily);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "px-6 py-3 text-sm transition-all duration-200 cursor-default",
          roundedClass,
          weightClass,
        )}
        style={{
          backgroundColor: color || "#c04a2b",
          color: textColor || "#ffffff",
          borderColor: borderColor || undefined,
          borderWidth: borderColor ? "1px" : undefined,
          fontFamily: font?.family,
        }}
      >
        My Awesome Link
      </div>
      <div
        className={cn(
          "px-6 py-3 text-sm transition-all duration-200 cursor-default opacity-70",
          roundedClass,
          weightClass,
        )}
        style={{
          backgroundColor: color || "#c04a2b",
          color: textColor || "#ffffff",
          borderColor: borderColor || undefined,
          borderWidth: borderColor ? "1px" : undefined,
          fontFamily: font?.family,
        }}
      >
        Another Link
      </div>
    </div>
  );
}

function ThemeCard({ theme: t, isSelected, isLocked, onClick, accentColor }: {
  theme: typeof themes[number];
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "relative h-24 rounded-xl bg-gradient-to-b border-2 transition-all overflow-hidden group",
        t.gradient,
        isSelected
          ? "border-brand-500 scale-105 shadow-lg"
          : isLocked
          ? "border-neutral-200 opacity-50 cursor-not-allowed"
          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:scale-[1.02]"
      )}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-neutral-900/40 rounded-xl z-10">
          <Lock className="w-5 h-5 text-neutral-400" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/20 to-transparent">
        <span className={cn("text-xs font-semibold", t.id === "dark" || t.id === "midnight" ? "text-white" : "text-neutral-900 dark:text-white")}>
          {t.name}
        </span>
      </div>
      {!isLocked && (
        <div
          className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      {t.isPro && (
        <div className="absolute top-2 right-2 z-10">
          <Crown className="w-3 h-3 text-yellow-500" />
        </div>
      )}
    </button>
  );
}

export default function AppearancePage() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro;
  const userName = session?.user?.name || "";
  const [activeTab, setActiveTab] = useState<string>("quickstart");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);
  const [history, setHistory] = useState<typeof defaultSettings[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [brandingUnlocked, setBrandingUnlocked] = useState(false);
  const [previewData, setPreviewData] = useState<{
    username: string;
    bio: string;
    avatarUrl: string;
    links: LinkData[];
    socialLinks: SocialLinkData[];
    products: ProductData[];
    embeds: EmbedData[];
    pages: PageData[];
    integrations: IntegrationData[];
  } | null>(null);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const savingRef = useRef(false);
  const loaded = useRef(false);

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, referralRes, linksRes, socialRes, productsRes, embedsRes, pagesRes, integrationsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/referral/stats").catch(() => null),
          fetch("/api/links").catch(() => null),
          fetch("/api/social").catch(() => null),
          fetch("/api/products").catch(() => null),
          fetch("/api/embeds").catch(() => null),
          fetch("/api/pages").catch(() => null),
          fetch("/api/integrations").catch(() => null),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          const newSettings = {
            accentColor: data.accentColor || "#c04a2b",
            theme: data.theme || "default",
            showBranding: data.showBranding ?? true,
            buttonStyle: data.buttonStyle || "rounded",
            bioAlignment: data.bioAlignment || "center",
            buttonTextColor: data.buttonTextColor || "#ffffff",
            backgroundColor: data.backgroundColor || "",
            avatarShape: data.avatarShape || "circle",
            fontFamily: data.fontFamily || "modern",
            fontSize: data.fontSize || "md",
            linkBorderWidth: data.linkBorderWidth || "none",
            linkShadow: data.linkShadow || "none",
            linkSpacing: data.linkSpacing || "normal",
            layoutMode: data.layoutMode || "list",
            hoverEffect: data.hoverEffect || "lift",
            showAvatar: data.showAvatar ?? true,
            showBio: data.showBio ?? true,
            headerImageUrl: data.headerImageUrl || "",
            customCss: data.customCss || "",
            isLocked: data.isLocked ?? false,
            pagePassword: data.pagePassword || "",
            buttonBorderColor: data.buttonBorderColor || "",
            buttonFontWeight: data.buttonFontWeight || "medium",
            countdownTitle: data.countdownTitle || "",
            countdownDate: data.countdownDate ? new Date(data.countdownDate).toISOString().slice(0, 16) : "",
            enableEmailCapture: data.enableEmailCapture ?? false,
            emailCaptureTitle: data.emailCaptureTitle || "",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            ogImageUrl: data.ogImageUrl || "",
            tipEnabled: data.tipEnabled ?? false,
            tipVenmo: data.tipVenmo || "",
            tipPayPal: data.tipPayPal || "",
            tipCashApp: data.tipCashApp || "",
          };
          setSettings(newSettings);
          setHistory([newSettings]);
          setHistoryIndex(0);
        }

        if (referralRes?.ok) {
          const data = await referralRes.json();
          setBrandingUnlocked(data.brandingUnlocked);
        }

        const preview: any = {};
        if (linksRes?.ok) preview.links = await linksRes.json();
        if (socialRes?.ok) preview.socialLinks = await socialRes.json();
        if (productsRes?.ok) preview.products = await productsRes.json();
        if (embedsRes?.ok) preview.embeds = await embedsRes.json();
        if (pagesRes?.ok) preview.pages = await pagesRes.json();
        if (integrationsRes?.ok) preview.integrations = await integrationsRes.json();

        setPreviewData({
          username: (session?.user as any)?.username || "",
          bio: "",
          avatarUrl: "",
          links: preview.links || [],
          socialLinks: preview.socialLinks || [],
          products: preview.products || [],
          embeds: preview.embeds || [],
          pages: preview.pages || [],
          integrations: preview.integrations || [],
        });

        loaded.current = true;
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  // Auto-save
  useEffect(() => {
    if (!loaded.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setMessage("Unsaved changes");
    autoSaveTimer.current = setTimeout(async () => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        const body: Record<string, any> = {
          accentColor: settings.accentColor,
          theme: settings.theme,
          showBranding: settings.showBranding,
          buttonStyle: settings.buttonStyle,
          bioAlignment: settings.bioAlignment,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          linkBorderWidth: settings.linkBorderWidth,
          linkShadow: settings.linkShadow,
          linkSpacing: settings.linkSpacing,
          layoutMode: settings.layoutMode,
          hoverEffect: settings.hoverEffect,
          showAvatar: settings.showAvatar,
          showBio: settings.showBio,
          isLocked: settings.isLocked,
          pagePassword: settings.pagePassword,
          buttonFontWeight: settings.buttonFontWeight,
          enableEmailCapture: settings.enableEmailCapture,
          emailCaptureTitle: settings.emailCaptureTitle,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          ogImageUrl: settings.ogImageUrl,
          tipEnabled: settings.tipEnabled,
          tipVenmo: settings.tipVenmo,
          tipPayPal: settings.tipPayPal,
          tipCashApp: settings.tipCashApp,
          headerImageUrl: settings.headerImageUrl || null,
        };
        if (isPro) {
          body.buttonTextColor = settings.buttonTextColor;
          body.avatarShape = settings.avatarShape;
          body.backgroundColor = settings.backgroundColor || null;
          body.customCss = settings.customCss || null;
          body.buttonBorderColor = settings.buttonBorderColor || null;
          body.countdownDate = settings.countdownDate || null;
        }
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setSaving(false);
        savingRef.current = false;
        setMessage(res.ok ? "Saved" : "Save failed");
        if (!res.ok) {
          setTimeout(() => setMessage(""), 5000);
        }
      } catch {
        setSaving(false);
        savingRef.current = false;
        setMessage("Save failed");
        setTimeout(() => setMessage(""), 5000);
      }
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [
    settings.accentColor, settings.theme, settings.showBranding, settings.buttonStyle, settings.bioAlignment,
    settings.fontFamily, settings.fontSize, settings.linkBorderWidth, settings.linkShadow, settings.linkSpacing,
    settings.layoutMode, settings.hoverEffect, settings.showAvatar, settings.showBio,
    settings.isLocked, settings.pagePassword, settings.buttonFontWeight, settings.enableEmailCapture,
    settings.emailCaptureTitle, settings.metaTitle, settings.metaDescription, settings.ogImageUrl,
    settings.tipEnabled, settings.tipVenmo, settings.tipPayPal, settings.tipCashApp,
    settings.buttonTextColor, settings.avatarShape, settings.backgroundColor, settings.headerImageUrl,
    settings.customCss, settings.buttonBorderColor, settings.countdownDate,
  ]);

  const updateSetting = useCallback(<K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setHistory((h) => {
        const newHistory = h.slice(0, historyIndex + 1);
        newHistory.push(next);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((i) => Math.min(i + 1, 49));
      return next;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setSettings(prev);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;

  const applyPreset = useCallback((preset: Template) => {
    setSettings((prev) => ({
      ...prev,
      theme: preset.appearance.theme,
      accentColor: preset.appearance.accentColor,
      buttonStyle: preset.appearance.buttonStyle,
      hoverEffect: preset.appearance.hoverEffect,
      layoutMode: preset.appearance.layoutMode,
      linkBorderWidth: preset.appearance.linkBorderWidth,
      linkShadow: preset.appearance.linkShadow,
      linkSpacing: preset.appearance.linkSpacing,
      fontFamily: preset.appearance.fontFamily,
      fontSize: preset.appearance.fontSize,
      ...(preset.appearance.buttonTextColor ? { buttonTextColor: preset.appearance.buttonTextColor } : {}),
      ...(preset.appearance.backgroundColor ? { backgroundColor: preset.appearance.backgroundColor } : {}),
      ...(preset.appearance.avatarShape ? { avatarShape: preset.appearance.avatarShape } : {}),
      ...(preset.appearance.showAvatar !== undefined ? { showAvatar: preset.appearance.showAvatar } : {}),
      ...(preset.appearance.showBio !== undefined ? { showBio: preset.appearance.showBio } : {}),
      ...(preset.appearance.buttonFontWeight ? { buttonFontWeight: preset.appearance.buttonFontWeight } : {}),
    }));
  }, []);

  const [includeTemplateContent, setIncludeTemplateContent] = useState(true)
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null)
  const [templateCategory, setTemplateCategory] = useState("All")

  const templateCategories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))]

  const applyTemplate = useCallback(async (template: Template) => {
    applyPreset(template)
    try {
      setApplyingTemplate(template.id)
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, includeContent: includeTemplateContent }),
      })
      const data = await res.json()
      if (res.ok) {
        let msg = `Applied "${template.name}" template`
        if (data.seededLinks || data.seededSocial) {
          msg += ` + added ${data.seededLinks + data.seededSocial} starter items`
        }
        toast.success(msg)
      } else {
        toast.error(data.error || "Failed to apply template")
      }
    } catch {
      toast.error("Failed to apply template")
    } finally {
      setApplyingTemplate(null)
    }
  }, [applyPreset, includeTemplateContent])

  const shuffleTemplate = useCallback(() => {
    const available = templates.filter((t) => !(t.isPro && !isPro))
    if (available.length === 0) return
    const pick = available[Math.floor(Math.random() * available.length)]
    applyTemplate(pick)
  }, [applyTemplate, isPro])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    setShowResetConfirm(false);
    toast.success("Reset to defaults");
  }, []);

  const shareStyle = useCallback(async () => {
    const params = new URLSearchParams({
      t: settings.theme,
      c: settings.accentColor,
      b: settings.buttonStyle,
      h: settings.hoverEffect,
      l: settings.layoutMode,
      f: settings.fontFamily,
      s: settings.fontSize,
    });
    const url = `${window.location.origin}/apply-style?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedStyle(true);
      toast.success("Style link copied!");
      setTimeout(() => setCopiedStyle(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [settings]);

  const canToggleBranding = isPro || brandingUnlocked;

  const harmonies = colorHarmonies[settings.accentColor] || colorHarmonies["#c04a2b"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appearance</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Customize how your page looks</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse" />
          <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
          <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex lg:gap-6 lg:items-start">
      {/* Settings Panel */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header with actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appearance</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Customize how your page looks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={shareStyle}
              aria-label="Share style"
            >
              {copiedStyle ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowResetConfirm(true)}
              aria-label="Reset to defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Reset all appearance settings to defaults?</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">This cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={resetToDefaults}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex md:grid md:grid-cols-8 gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Pre-made Templates"
              description="Start in seconds — pick a template for your niche and we'll set the style (and optional starter links)"
              icon={<Zap className="w-5 h-5" />}
            >
              <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 mb-4">
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 mt-0.5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Add starter links & socials</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Only fills empty pages — never overwrites your existing links</p>
                  </div>
                </div>
                <Switch
                  checked={includeTemplateContent}
                  onCheckedChange={setIncludeTemplateContent}
                  aria-label="Include starter content"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {templateCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        templateCategory === cat
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={shuffleTemplate}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Apply a random template"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Surprise me
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.filter((t) => templateCategory === "All" || t.category === templateCategory).map((template) => {
                  const isLocked = template.isPro && !isPro;
                  const isActive = settings.theme === template.appearance.theme && settings.accentColor === template.appearance.accentColor;
                  const applying = applyingTemplate === template.id;
                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left group",
                        isActive
                          ? "border-brand-500 shadow-lg"
                          : isLocked
                          ? "border-neutral-200 dark:border-neutral-700"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md"
                      )}
                    >
                      <button
                        onClick={() => !isLocked && applyTemplate(template)}
                        disabled={isLocked || applying}
                        aria-pressed={isActive}
                        className={cn(
                          "text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          isLocked && "cursor-not-allowed"
                        )}
                      >
                        <div className={cn("h-24 bg-gradient-to-br flex items-end p-3", template.previewGradient)}>
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-2xl drop-shadow-sm">{template.emoji}</span>
                            <div className="flex gap-1.5 ml-auto">
                              <div className={cn("w-3 h-3 rounded-full", template.previewAccent)} />
                              <div className={cn("w-3 h-3 rounded-full opacity-60", template.previewAccent)} />
                              <div className={cn("w-3 h-3 rounded-full opacity-30", template.previewAccent)} />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-neutral-900">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            {template.name}
                            {isLocked && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">{template.description}</p>
                          <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mt-2">{template.category}</p>
                        </div>
                      </button>
                      <div className="px-3 pb-3 pt-0 bg-white dark:bg-neutral-900">
                        <button
                          onClick={() => !isLocked && applyTemplate(template)}
                          disabled={isLocked || applying}
                          className={cn(
                            "w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                            isLocked
                              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                              : "bg-brand-600 text-white hover:bg-brand-700"
                          )}
                        >
                          {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {isLocked ? "Pro only" : applying ? "Applying..." : "Use template"}
                        </button>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center z-10">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Live Button Preview"
              description="See how your buttons will look with current settings"
              icon={<MousePointer className="w-5 h-5" />}
            >
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
                <ButtonPreview
                  style={settings.buttonStyle}
                  color={settings.accentColor}
                  textColor={settings.buttonTextColor}
                  borderColor={settings.buttonBorderColor}
                  fontWeight={settings.buttonFontWeight}
                  fontFamily={settings.fontFamily}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Color Suggestions"
              description="Colors that complement your current accent"
              icon={<Palette className="w-5 h-5" />}
            >
              <div className="flex flex-wrap gap-3">
                {harmonies.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSetting("accentColor", color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                      settings.accentColor === color ? "border-neutral-900 dark:border-white scale-110" : "border-neutral-200 dark:border-neutral-700"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Use ${color} as accent`}
                  />
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Theme"
              description="Choose a design system for your page — includes background, text colors, and overall style"
              icon={<Palette className="w-5 h-5" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {themes.map((t) => {
                  const isProTheme = proThemes.includes(t.id);
                  const isLocked = isProTheme && !isPro;
                  const isSelected = settings.theme === t.id && !isLocked;
                  return (
                    <ThemeCard
                      key={t.id}
                      theme={t}
                      isSelected={isSelected}
                      isLocked={isLocked}
                      onClick={() => !isLocked && updateSetting("theme", t.id)}
                      accentColor={settings.accentColor}
                    />
                  );
                })}
              </div>
              {!isPro && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
                  {proThemes.length} additional themes available on the Pro plan.
                </p>
              )}
            </SectionCard>

            <SectionCard
              title="Accent Color"
              description="Choose your button and highlight color"
              icon={<Sparkles className="w-5 h-5" />}
            >
              <ColorPicker
                value={settings.accentColor}
                onChange={(c) => updateSetting("accentColor", c)}
                presets={presetColors}
                label="Accent Color"
              />
            </SectionCard>

            {isPro && (
              <SectionCard
                title="Custom Background Color"
                description="Override your theme with a solid background color of your choice"
                icon={<Image className="w-5 h-5" />}
              >
                <ColorPicker
                  value={settings.backgroundColor}
                  onChange={(c) => updateSetting("backgroundColor", c)}
                  presets={bgPresetColors}
                  label="Background Color"
                />
              </SectionCard>
            )}
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Button Style"
              description="Choose the shape of your link buttons"
              icon={<Square className="w-5 h-5" />}
            >
              <div className="flex flex-wrap gap-3">
                {buttonStyles.map((bs) => (
                  <button
                    key={bs.id}
                    onClick={() => updateSetting("buttonStyle", bs.id)}
                    aria-pressed={settings.buttonStyle === bs.id}
                    className={cn(
                      "flex-1 min-w-[120px] py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.buttonStyle === bs.id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100"
                    )}
                  >
                    <div
                      className={cn("w-full h-8 mx-auto mb-2 transition-colors", bs.className)}
                      style={{ backgroundColor: settings.accentColor || "#c04a2b" }}
                    />
                    {bs.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Bio Alignment"
              description="How your bio text is aligned"
              icon={<AlignLeft className="w-5 h-5" />}
            >
              <div className="flex flex-wrap gap-3">
                {alignmentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSetting("bioAlignment", opt.id)}
                    aria-pressed={settings.bioAlignment === opt.id}
                    className={cn(
                      "flex-1 min-w-[100px] py-3 px-4 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.bioAlignment === opt.id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100"
                    )}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            {isPro && (
              <SectionCard
                title="Button Text Color"
                description="Customize the text color on your buttons"
                icon={<Type className="w-5 h-5" />}
              >
                <ColorPicker
                  value={settings.buttonTextColor}
                  onChange={(c) => updateSetting("buttonTextColor", c)}
                  presets={textPresetColors}
                  label="Button Text Color"
                />
              </SectionCard>
            )}

            {isPro && (
              <SectionCard
                title="Button Border Color"
                description="Override the border color on your link buttons"
                icon={<Box className="w-5 h-5" />}
              >
                <ColorPicker
                  value={settings.buttonBorderColor}
                  onChange={(c) => updateSetting("buttonBorderColor", c)}
                  presets={["#ffffff", "#e5e7eb", "#9ca3af", "#374151", "#000000", settings.accentColor].filter(Boolean)}
                  label="Button Border Color"
                />
              </SectionCard>
            )}

            {isPro && (
              <SectionCard
                title="Button Font Weight"
                description="Control how bold your link button text appears"
                icon={<Type className="w-5 h-5" />}
              >
              <OptionGrid
                options={fontWeightOptions as any}
                value={settings.buttonFontWeight}
                onChange={(v) => updateSetting("buttonFontWeight", v as any)}
              />
              </SectionCard>
            )}

            <SectionCard
              title="Avatar Shape"
              description="Change how your profile picture is displayed"
              icon={<Image className="w-5 h-5" />}
              pro={!isPro}
            >
              <div className="flex flex-wrap gap-3">
                {avatarShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => !isPro || updateSetting("avatarShape", shape.id)}
                    disabled={!isPro}
                    aria-pressed={settings.avatarShape === shape.id && isPro}
                    className={cn(
                      "flex-1 min-w-[100px] py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.avatarShape === shape.id && isPro
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100",
                      !isPro && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-12 h-12 mx-auto mb-2", shape.className)} style={{ backgroundColor: settings.accentColor || "#c04a2b" }} />
                    {shape.name}
                    {!isPro && <ProBadge />}
                  </button>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Font Family"
              description="Choose the font for your link buttons"
              icon={<Type className="w-5 h-5" />}
            >
              <OptionGrid
                options={fontFamilies as any}
                value={settings.fontFamily}
                onChange={(v) => updateSetting("fontFamily", v as any)}
                renderOption={(opt: any, selected) => (
                  <div className="flex flex-col items-center gap-1 w-full">
                    <span style={{ fontFamily: opt.family }} className="text-base">{opt.name}</span>
                    <span style={{ fontFamily: opt.family }} className="text-xs opacity-60">{opt.preview}</span>
                  </div>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Font Size"
              description="Adjust the text size on your link buttons"
              icon={<Type className="w-5 h-5" />}
            >
              <OptionGrid
                options={fontSizeOptions as any}
                value={settings.fontSize}
                onChange={(v) => updateSetting("fontSize", v as any)}
                renderOption={(opt: any, selected) => (
                  <div className="flex flex-col items-center gap-1">
                    <span className={opt.className}>Aa</span>
                    <span className="text-xs opacity-60">{opt.name}</span>
                  </div>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Live Typography Preview"
              description="See how your text looks with the selected font and size"
              icon={<Eye className="w-5 h-5" />}
            >
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6">
                <div
                  className={cn(
                    fontSizeOptions.find(s => s.id === settings.fontSize)?.className,
                  )}
                  style={{
                    fontFamily: fontFamilies.find(f => f.id === settings.fontFamily)?.family,
                  }}
                >
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">Your Name</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Creator & Designer</p>
                  <div className="mt-4 space-y-2">
                    <div
                      className={cn(
                        "px-4 py-2 text-center",
                        buttonStyles.find(s => s.id === settings.buttonStyle)?.className,
                      )}
                      style={{ backgroundColor: settings.accentColor || "#c04a2b", color: settings.buttonTextColor || "#fff" }}
                    >
                      Visit My Portfolio
                    </div>
                    <div
                      className={cn(
                        "px-4 py-2 text-center",
                        buttonStyles.find(s => s.id === settings.buttonStyle)?.className,
                      )}
                      style={{ backgroundColor: settings.accentColor || "#c04a2b", color: settings.buttonTextColor || "#fff" }}
                    >
                      Follow on Twitter
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Link Border"
              description="Add a border around your link buttons"
              icon={<Square className="w-5 h-5" />}
            >
              <OptionGrid
                options={borderWidthOptions as any}
                value={settings.linkBorderWidth}
                onChange={(v) => updateSetting("linkBorderWidth", v as any)}
              />
              {settings.linkBorderWidth !== "none" && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  Border color matches your accent color.
                </p>
              )}
            </SectionCard>

            <SectionCard
              title="Link Shadow"
              description="Add a shadow effect to your link buttons"
              icon={<Layers className="w-5 h-5" />}
            >
              <OptionGrid
                options={shadowOptions as any}
                value={settings.linkShadow}
                onChange={(v) => updateSetting("linkShadow", v as any)}
              />
            </SectionCard>

            <SectionCard
              title="Link Spacing"
              description="Control the spacing between your links"
              icon={<Layers className="w-5 h-5" />}
            >
              <OptionGrid
                options={spacingOptions as any}
                value={settings.linkSpacing}
                onChange={(v) => updateSetting("linkSpacing", v as any)}
              />
            </SectionCard>

            <SectionCard
              title="Layout Mode"
              description="Choose how your links are arranged on the page"
              icon={<LayoutGrid className="w-5 h-5" />}
            >
              <OptionGrid
                options={layoutModes as any}
                value={settings.layoutMode}
                onChange={(v) => updateSetting("layoutMode", v as any)}
                renderOption={(opt: any, selected) => (
                  <>
                    {opt.id === "list" ? (
                      <div className="flex flex-col gap-1.5 w-12">
                        <div className="h-2 bg-current rounded opacity-40" />
                        <div className="h-2 bg-current rounded opacity-40" />
                        <div className="h-2 bg-current rounded opacity-40" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5 w-12">
                        <div className="h-2 bg-current rounded opacity-40" />
                        <div className="h-2 bg-current rounded opacity-40" />
                        <div className="h-2 bg-current rounded opacity-40" />
                        <div className="h-2 bg-current rounded opacity-40" />
                      </div>
                    )}
                    <span>{opt.name}</span>
                  </>
                )}
              />
            </SectionCard>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Hover Effect"
              description="Animation when someone hovers over your link buttons"
              icon={<MousePointer className="w-5 h-5" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hoverEffects.map((effect) => {
                  const isSelected = settings.hoverEffect === effect.id;
                  return (
                    <button
                      key={effect.id}
                      onClick={() => updateSetting("hoverEffect", effect.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all group cursor-pointer",
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                          : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className={cn("w-16 h-8 rounded-lg transition-all duration-200", effect.id === "none" ? "" : `group-hover:${effect.className?.replace("hover:", "") || ""}`)} style={{ backgroundColor: settings.accentColor || "#c04a2b" }} />
                      <span>{effect.name}</span>
                      {effect.description && (
                        <span className="text-[10px] opacity-60">{effect.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {isPro && (
              <SectionCard
                title="Countdown Timer"
                description="Show a countdown on your page for launches or events"
                icon={<Clock className="w-5 h-5" />}
              >
                <div className="space-y-4">
                  <Input
                    label="Countdown Title"
                    value={settings.countdownTitle}
                    onChange={(e) => updateSetting("countdownTitle", e.target.value)}
                    placeholder="e.g. Launching in"
                  />
                  <Input
                    label="Countdown Date"
                    type="datetime-local"
                    value={settings.countdownDate}
                    onChange={(e) => updateSetting("countdownDate", e.target.value)}
                  />
                </div>
              </SectionCard>
            )}

            {isPro && (
              <SectionCard
                title="Custom CSS"
                description="Inject custom CSS to style your page (advanced)"
                icon={<Code className="w-5 h-5" />}
              >
                <div className="space-y-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    Caution: Invalid CSS may break your page layout. Changes are applied in real-time.
                  </p>
                  <Textarea
                    value={settings.customCss}
                    onChange={(e) => updateSetting("customCss", e.target.value)}
                    placeholder="/* Add your custom CSS here */
.my-link { background: red !important; }"
                    className="font-mono text-sm min-h-[120px]"
                  />
                </div>
              </SectionCard>
            )}
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Visibility"
              description="Toggle which elements appear on your public page"
              icon={<Eye className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={settings.showAvatar}
                    onCheckedChange={(checked) => updateSetting("showAvatar", checked)}
                  />
                  <span className="text-sm">Show profile picture</span>
                </Label>
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={settings.showBio}
                    onCheckedChange={(checked) => updateSetting("showBio", checked)}
                  />
                  <span className="text-sm">Show bio text</span>
                </Label>
              </div>
            </SectionCard>

            <SectionCard
              title="Header Image"
              description="Add a banner image at the top of your page"
              icon={<Image className="w-5 h-5" />}
            >
              <div className="space-y-2">
                <Input
                  value={settings.headerImageUrl}
                  onChange={(e) => updateSetting("headerImageUrl", e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
                {settings.headerImageUrl && (
                  <img
                    src={settings.headerImageUrl}
                    alt="Header preview"
                    className="w-full h-32 object-cover rounded-xl border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Recommended size: 1200x600px. Will be cropped to 2:1 ratio.
                </p>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6 pt-4 animate-in fade-in-0 duration-200">
            <SectionCard
              title="Password Protection"
              description="Lock your page behind a password"
              icon={<Lock className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={settings.isLocked}
                    onCheckedChange={(checked) => updateSetting("isLocked", checked)}
                  />
                  <span className="text-sm">Lock my page with a password</span>
                </Label>
                {settings.isLocked && (
                  <Input
                    type="password"
                    value={settings.pagePassword}
                    onChange={(e) => updateSetting("pagePassword", e.target.value)}
                    placeholder="Enter a password"
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Email Capture"
              description="Collect email addresses from your visitors"
              icon={<Mail className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={settings.enableEmailCapture}
                    onCheckedChange={(checked) => updateSetting("enableEmailCapture", checked)}
                  />
                  <span className="text-sm">Show email signup form on my page</span>
                </Label>
                {settings.enableEmailCapture && (
                  <Input
                    value={settings.emailCaptureTitle}
                    onChange={(e) => updateSetting("emailCaptureTitle", e.target.value)}
                    placeholder="e.g. Join my newsletter"
                  />
                )}
              </div>
            </SectionCard>

            {isPro && (
              <SectionCard
                title="SEO & Meta Tags"
                description="Customize how your page appears in search results and social shares"
                icon={<Search className="w-5 h-5" />}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Page Title</Label>
                    <Input
                      value={settings.metaTitle}
                      onChange={(e) => updateSetting("metaTitle", e.target.value)}
                      placeholder={`${userName || "Your Name"} | Flolio`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Meta Description</Label>
                    <Textarea
                      value={settings.metaDescription}
                      onChange={(e) => updateSetting("metaDescription", e.target.value)}
                      placeholder="A short description for search engines"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">OG Image URL</Label>
                    <Input
                      value={settings.ogImageUrl}
                      onChange={(e) => updateSetting("ogImageUrl", e.target.value)}
                      placeholder="https://example.com/social-card.jpg"
                    />
                    {settings.ogImageUrl && (
                      <img src={settings.ogImageUrl} alt="" className="w-full h-24 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Recommended: 1200x630px for social media cards.
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard
              title="Tip Jar"
              description="Let visitors support you with donations"
              icon={<Heart className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={settings.tipEnabled}
                    onCheckedChange={(checked) => updateSetting("tipEnabled", checked)}
                  />
                  <span className="text-sm">Enable tip jar on my page</span>
                </Label>
                {settings.tipEnabled && (
                  <div className="space-y-3 pl-7">
                    <div>
                      <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Venmo Handle</Label>
                      <Input value={settings.tipVenmo} onChange={(e) => updateSetting("tipVenmo", e.target.value)} placeholder="@username" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">PayPal Handle</Label>
                      <Input value={settings.tipPayPal} onChange={(e) => updateSetting("tipPayPal", e.target.value)} placeholder="@username" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Cash App Handle</Label>
                      <Input value={settings.tipCashApp} onChange={(e) => updateSetting("tipCashApp", e.target.value)} placeholder="$cashtag" />
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Branding"
              description={canToggleBranding
                ? "Toggle the 'Powered by Flolio' badge on your page"
                : brandingUnlocked
                ? "You've unlocked branding removal via referrals!"
                : "Upgrade to Pro or refer 3 friends to remove branding"}
              icon={<Crown className="w-5 h-5" />}
            >
              <Label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={settings.showBranding}
                  onCheckedChange={(checked) => updateSetting("showBranding", checked)}
                  disabled={!canToggleBranding}
                />
                <span className="text-sm">Show "Powered by Flolio" on my page</span>
              </Label>
              {!canToggleBranding && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
                  Upgrade to Pro or refer 3 friends to remove branding.
                </p>
              )}
              {brandingUnlocked && !isPro && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Branding removal unlocked via referrals!
                </p>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Save Status */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 sticky bottom-0 bg-background z-10 py-3">
          <p className={cn("text-sm transition-colors duration-200", message === "Saved" ? "text-green-600 dark:text-green-400" : message === "Save failed" ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400")}>
            {message || (saving ? "Saving..." : "All changes saved")}
          </p>
          <Button onClick={() => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); }} variant="outline" size="sm" disabled={saving || !message || message === "Saved"}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save
          </Button>
        </div>
      </div>

      {/* Live Preview Panel */}
      {previewData && (
        <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6" style={{ maxHeight: "calc(100vh - 2rem)" }}>
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden">
            <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Live Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="Mobile preview"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4" style={{ maxHeight: "calc(100vh - 14rem)", overflow: "auto" }}>
              <ProfilePreview
                name={userName}
                bio=""
                avatarUrl=""
                username={previewData.username}
                isPro={isPro}
                accentColor={settings.accentColor}
                theme={settings.theme}
                showBranding={settings.showBranding}
                buttonStyle={settings.buttonStyle}
                bioAlignment={settings.bioAlignment}
                buttonTextColor={settings.buttonTextColor}
                backgroundColor={settings.backgroundColor}
                avatarShape={settings.avatarShape}
                fontFamily={settings.fontFamily}
                fontSize={settings.fontSize}
                linkBorderWidth={settings.linkBorderWidth}
                linkShadow={settings.linkShadow}
                linkSpacing={settings.linkSpacing}
                layoutMode={settings.layoutMode}
                hoverEffect={settings.hoverEffect}
                showAvatar={settings.showAvatar}
                showBio={settings.showBio}
                headerImageUrl={settings.headerImageUrl}
                customCss={settings.customCss}
                isLocked={settings.isLocked}
                pagePassword={settings.pagePassword}
                buttonBorderColor={settings.buttonBorderColor}
                buttonFontWeight={settings.buttonFontWeight}
                countdownTitle={settings.countdownTitle}
                countdownDate={settings.countdownDate}
                enableEmailCapture={settings.enableEmailCapture}
                emailCaptureTitle={settings.emailCaptureTitle}
                metaTitle={settings.metaTitle}
                metaDescription={settings.metaDescription}
                ogImageUrl={settings.ogImageUrl}
                tipEnabled={settings.tipEnabled}
                tipVenmo={settings.tipVenmo}
                tipPayPal={settings.tipPayPal}
                tipCashApp={settings.tipCashApp}
                links={previewData.links}
                socialLinks={previewData.socialLinks}
                products={previewData.products}
                embeds={previewData.embeds}
                pages={previewData.pages}
                integrations={previewData.integrations}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Preview Sheet */}
      {showMobilePreview && previewData && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setShowMobilePreview(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setShowMobilePreview(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile preview"
        >
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-neutral-950 z-10 pt-3 pb-2 flex items-center justify-center">
              <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute right-2 w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Close preview"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="px-2 pb-6">
              <ProfilePreview
                name={userName}
                bio=""
                avatarUrl=""
                username={previewData.username}
                isPro={isPro}
                accentColor={settings.accentColor}
                theme={settings.theme}
                showBranding={settings.showBranding}
                buttonStyle={settings.buttonStyle}
                bioAlignment={settings.bioAlignment}
                buttonTextColor={settings.buttonTextColor}
                backgroundColor={settings.backgroundColor}
                avatarShape={settings.avatarShape}
                fontFamily={settings.fontFamily}
                fontSize={settings.fontSize}
                linkBorderWidth={settings.linkBorderWidth}
                linkShadow={settings.linkShadow}
                linkSpacing={settings.linkSpacing}
                layoutMode={settings.layoutMode}
                hoverEffect={settings.hoverEffect}
                showAvatar={settings.showAvatar}
                showBio={settings.showBio}
                headerImageUrl={settings.headerImageUrl}
                customCss={settings.customCss}
                isLocked={settings.isLocked}
                pagePassword={settings.pagePassword}
                buttonBorderColor={settings.buttonBorderColor}
                buttonFontWeight={settings.buttonFontWeight}
                countdownTitle={settings.countdownTitle}
                countdownDate={settings.countdownDate}
                enableEmailCapture={settings.enableEmailCapture}
                emailCaptureTitle={settings.emailCaptureTitle}
                metaTitle={settings.metaTitle}
                metaDescription={settings.metaDescription}
                ogImageUrl={settings.ogImageUrl}
                tipEnabled={settings.tipEnabled}
                tipVenmo={settings.tipVenmo}
                tipPayPal={settings.tipPayPal}
                tipCashApp={settings.tipCashApp}
                links={previewData.links}
                socialLinks={previewData.socialLinks}
                products={previewData.products}
                embeds={previewData.embeds}
                pages={previewData.pages}
                integrations={previewData.integrations}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Mobile Preview Button */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label="Open mobile preview"
      >
        <Smartphone className="w-5 h-5" />
      </button>
    </div>
  );
}
