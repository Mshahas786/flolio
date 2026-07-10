"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  EyeOff,
  Box,
  Mail,
  Code,
  Clock,
  Search,
  Heart,
  Palette,
  FontSize,
  Shadow,
  Layers,
  MousePointer,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  Save,
  Loader2,
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
} from "@/lib/customization";
import { ProfilePreview } from "@/components/dashboard/profile-preview";
import type { LinkData, SocialLinkData, ProductData, EmbedData, PageData, IntegrationData } from "@/components/public-page/public-profile";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
  { id: "theme", label: "Theme", icon: Palette },
  { id: "buttons", label: "Buttons", icon: Square },
  { id: "typography", label: "Typography", icon: Type },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "advanced", label: "Advanced", icon: Code },
] as const;

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
      <Crown className="w-3 h-3" /> Pro
    </span>
  );
}

function ProLock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-neutral-900/40 rounded-xl">
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
            <span className="text-xs font-bold" style={{ color: value === "#ffffff" ? "#000" : "#fff" }}>
              {value === "#ffffff" ? "FFF" : ""}
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
              value === color ? "border-neutral-900 dark:border-white scale-110" : "border-neutral-200 dark:border-neutral-700"
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
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

export default function AppearancePage() {
  const { data: session, update } = useSession();
  const isPro = (session?.user as any)?.isPro;
  const userName = session?.user?.name || "";
  const [activeTab, setActiveTab] = useState<string>("theme");
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
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
  });

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
          setSettings((prev) => ({
            ...prev,
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
          }));
        }

        if (referralRes?.ok) {
          const data = await referralRes.json();
          setBrandingUnlocked(data.brandingUnlocked);
        }

        // Load preview data
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
    setMessage("");
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
      } catch {
        setSaving(false);
        savingRef.current = false;
        setMessage("Save failed");
      }
    }, 800);
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

  const handleSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    savingRef.current = true;
    setSaving(true);
    setMessage("");
    // Same body as above
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
    if (res.ok) update();
  };

  const canToggleBranding = isPro || brandingUnlocked;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appearance</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Customize how your page looks</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: {
    theme: string;
    buttonStyle: string;
    hoverEffect: string;
    layoutMode: string;
  }) => {
    updateSetting("theme", preset.theme);
    updateSetting("buttonStyle", preset.buttonStyle);
    updateSetting("hoverEffect", preset.hoverEffect);
    updateSetting("layoutMode", preset.layoutMode);
  };

  const themePresets = [
    { id: "clean", name: "Clean", theme: "default", buttonStyle: "rounded", hoverEffect: "lift", layoutMode: "list", swatch: "bg-gradient-to-br from-neutral-50 to-white" },
    { id: "bold", name: "Bold", theme: "dark", buttonStyle: "pill", hoverEffect: "glow", layoutMode: "list", swatch: "bg-gradient-to-br from-neutral-900 to-neutral-800" },
    { id: "playful", name: "Playful", theme: "sunset", buttonStyle: "pill", hoverEffect: "scale", layoutMode: "grid", swatch: "bg-gradient-to-br from-orange-50 to-rose-50" },
    { id: "modern", name: "Modern", theme: "mint", buttonStyle: "square", hoverEffect: "slide", layoutMode: "list", swatch: "bg-gradient-to-br from-emerald-50 to-teal-50" },
    { id: "elegant", name: "Elegant", theme: "lavender", buttonStyle: "rounded", hoverEffect: "lift", layoutMode: "list", swatch: "bg-gradient-to-br from-violet-50 to-purple-50", isPro: true },
    { id: "edgy", name: "Edgy", theme: "midnight", buttonStyle: "square", hoverEffect: "none", layoutMode: "grid", swatch: "bg-gradient-to-br from-indigo-950 to-slate-900", isPro: true },
  ];

  return (
    <div className="lg:flex lg:gap-6 lg:items-start">
      {/* Settings Panel */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Appearance</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Customize how your page looks</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 lg:grid-cols-8 gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
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
                    <button
                      key={t.id}
                      onClick={() => !isLocked && updateSetting("theme", t.id)}
                      disabled={isLocked}
                      className={cn(
                        "relative h-20 rounded-lg bg-gradient-to-b border-2 transition-all",
                        t.gradient,
                        "border-neutral-200 dark:border-neutral-700",
                        isSelected
                          ? "border-brand-500 scale-105"
                          : isLocked
                          ? "border-neutral-200 opacity-50 cursor-not-allowed"
                          : "hover:border-neutral-300 dark:hover:border-neutral-600"
                      )}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-neutral-900/40 rounded-lg">
                          <Lock className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <span className={cn("text-xs font-medium", t.id === "dark" || t.id === "midnight" ? "text-white" : "text-neutral-900 dark:text-white")}>
                        {t.name}
                      </span>
                      {isProTheme && (
                        <div className="absolute top-1 right-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {!isPro && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
                  5 additional themes available on the Pro plan.
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

            <SectionCard
              title="Theme Presets"
              description="Apply a complete style bundle in one click"
              icon={<Sparkles className="w-5 h-5" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    disabled={preset.isPro && !isPro}
                    className={cn(
                      "relative flex flex-col items-center gap-2 py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.theme === preset.theme &&
                      settings.buttonStyle === preset.buttonStyle &&
                      settings.hoverEffect === preset.hoverEffect &&
                      settings.layoutMode === preset.layoutMode
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100",
                      preset.isPro && !isPro && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-full h-10 rounded-lg", preset.swatch)} />
                    <span>{preset.name}</span>
                    {preset.isPro && !isPro && (
                      <div className="absolute top-1 right-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
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
                    className={cn(
                      "flex-1 min-w-[120px] py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.buttonStyle === bs.id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100"
                    )}
                  >
                    <div className={cn("w-full h-8 bg-neutral-300 mx-auto mb-2", bs.className)} />
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
                  options={fontWeightOptions}
                  value={settings.buttonFontWeight}
                  onChange={(v) => updateSetting("buttonFontWeight", v)}
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
                    className={cn(
                      "flex-1 min-w-[100px] py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all",
                      settings.avatarShape === shape.id && isPro
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-100",
                      !isPro && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-12 h-12 bg-neutral-300 mx-auto mb-2", shape.className)} />
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
                options={fontFamilies}
                value={settings.fontFamily}
                onChange={updateSetting}
                renderOption={(opt, selected) => (
                  <span style={{ fontFamily: opt.family }}>{opt.name}</span>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Font Size"
              description="Adjust the text size on your link buttons"
              icon={<FontSize className="w-5 h-5" />}
            >
              <OptionGrid
                options={fontSizeOptions}
                value={settings.fontSize}
                onChange={updateSetting}
                renderOption={(opt, selected) => (
                  <span className={opt.className}>{opt.name}</span>
                )}
              />
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
                options={borderWidthOptions}
                value={settings.linkBorderWidth}
                onChange={updateSetting}
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
              icon={<Shadow className="w-5 h-5" />}
            >
              <OptionGrid
                options={shadowOptions}
                value={settings.linkShadow}
                onChange={updateSetting}
              />
            </SectionCard>

            <SectionCard
              title="Link Spacing"
              description="Control the spacing between your links"
              icon={<Layers className="w-5 h-5" />}
            >
              <OptionGrid
                options={spacingOptions}
                value={settings.linkSpacing}
                onChange={updateSetting}
              />
            </SectionCard>

            <SectionCard
              title="Layout Mode"
              description="Choose how your links are arranged on the page"
              icon={<LayoutGrid className="w-5 h-5" />}
            >
              <OptionGrid
                options={layoutModes}
                value={settings.layoutMode}
                onChange={updateSetting}
                renderOption={(opt, selected) => (
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
              <OptionGrid
                options={hoverEffects}
                value={settings.hoverEffect}
                onChange={updateSetting}
              />
            </SectionCard>

            {isPro && (
              <SectionCard
                title="Countdown Timer"
                description="Show a countdown on your page for launches or events"
                icon={<Clock className="w-5 h-5" />}
              >
                <div className="space-y-4">
                  <Input
                    value={settings.countdownTitle}
                    onChange={(e) => updateSetting("countdownTitle", e.target.value)}
                    placeholder="e.g. Launching in"
                  />
                  <Input
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
                <Textarea
                  value={settings.customCss}
                  onChange={(e) => updateSetting("customCss", e.target.value)}
                  placeholder="/* Add your custom CSS here */
.my-link { background: red !important; }"
                  className="font-mono text-sm min-h-[120px]"
                />
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
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className={cn("text-sm", message === "Saved" ? "text-green-600 dark:text-green-400" : message === "Save failed" ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400")}>
            {message || (saving ? "Saving..." : "All changes saved")}
          </p>
          <Button onClick={handleSave} variant="outline" size="sm" disabled={saving}>
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
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
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
                buttonTextColor={settings.buttonTextColor || null}
                backgroundColor={settings.backgroundColor || null}
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
                buttonBorderColor={settings.buttonBorderColor || null}
                buttonFontWeight={settings.buttonFontWeight}
                countdownTitle={settings.countdownTitle}
                countdownDate={settings.countdownDate || null}
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
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobilePreview(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-neutral-950 z-10 pt-3 pb-2 flex items-center justify-center">
              <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute right-2 w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                buttonTextColor={settings.buttonTextColor || null}
                backgroundColor={settings.backgroundColor || null}
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
                buttonBorderColor={settings.buttonBorderColor || null}
                buttonFontWeight={settings.buttonFontWeight}
                countdownTitle={settings.countdownTitle}
                countdownDate={settings.countdownDate || null}
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
    </div>
  );
}