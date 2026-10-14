import { useState } from 'react';
import { Building2, Phone, MapPin, Armchair, DollarSign, Palette, Sparkles, Sun, Info, Save, RotateCcw, Shuffle, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useLibrary } from '@/context/LibraryContext';
import type { BackgroundMode, AccentPalette, LibrarySettings as SettingsType } from '@/types';

const themes: { value: BackgroundMode; label: string; description: string; Icon: typeof Sun; preview: string }[] = [
  { value: 'modern-grey', label: 'Modern Grey', description: 'Quiet neutral workspace', Icon: Sun, preview: 'preview-grey' },
  { value: 'galaxy', label: 'Galaxy', description: 'A soft, living night sky', Icon: Sparkles, preview: 'preview-galaxy' },
  { value: 'random-color', label: 'Random Color', description: 'Curated accents, your choice', Icon: Palette, preview: 'preview-color' },
];
const palettes: { value: AccentPalette; label: string }[] = [
  { value: 'lagoon', label: 'Lagoon' }, { value: 'citrus', label: 'Citrus' },
  { value: 'berry', label: 'Berry' }, { value: 'terracotta', label: 'Terracotta' },
  { value: 'jade', label: 'Jade' },
];

export default function SettingsPage() {
  const { settings, updateSettings, showToast } = useLibrary();
  const [form, setForm] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsType>(key: K, value: SettingsType[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function selectBackgroundMode(mode: BackgroundMode) {
    const palette = mode === 'random-color'
      ? palettes[Math.floor(Math.random() * palettes.length)].value
      : form.accentPalette || 'lagoon';
    setForm((prev) => ({ ...prev, backgroundMode: mode, accentPalette: palette }));
    updateSettings({ backgroundMode: mode, ...(mode === 'random-color' ? { accentPalette: palette } : {}) });
    setSaved(false);
  }

  function shufflePalette() {
    const choices = palettes.filter((palette) => palette.value !== form.accentPalette);
    const next = choices[Math.floor(Math.random() * choices.length)].value;
    setForm((prev) => ({ ...prev, accentPalette: next }));
    updateSettings({ accentPalette: next });
    setSaved(false);
  }

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    showToast('Settings saved for this session', 'success');
  }

  function handleReset() {
    setForm({ ...settings });
    setSaved(false);
    showToast('Settings reverted to current session values', 'info');
  }

  const inputClass = 'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-400/40 focus:bg-white/8';
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';
  const sectionClass = 'rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md';
  const sectionTitleClass = 'mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300';

  return (
    <div className="animate-fade-in max-w-4xl">
      <PageHeader
        title="Settings"
        description="Configure library information and visual preferences. Theme changes apply across the workspace immediately."
      />

      <div className="space-y-6">
        {/* Library Information */}
        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Building2 className="h-5 w-5 text-sky-400" />
            Library Information
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Library Name</label>
              <input
                type="text"
                value={form.libraryName}
                onChange={(e) => update('libraryName', e.target.value)}
                className={inputClass}
                placeholder="e.g. Oceanic Study Library"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Library Address</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className={inputClass}
                placeholder="e.g. 12 Marine Drive, Mumbai"
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Contact Number</span>
              </label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => update('contactNumber', e.target.value)}
                className={inputClass}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                className={inputClass}
                placeholder="INR"
              />
              <p className="mt-1 text-xs text-slate-500">Default: INR (₹)</p>
            </div>
          </div>
        </div>

        {/* Seat & Fee Configuration */}
        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Armchair className="h-5 w-5 text-cyan-400" />
            Seat & Fee Configuration
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Total Seats</label>
              <input
                type="number"
                value={form.totalSeats}
                onChange={(e) => update('totalSeats', Number(e.target.value))}
                className={inputClass}
                min="1"
              />
              <p className="mt-1 text-xs text-slate-500">Used as configuration preview only</p>
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Default Monthly Fee (₹)</span>
              </label>
              <input
                type="number"
                value={form.defaultMonthlyFee}
                onChange={(e) => update('defaultMonthlyFee', Number(e.target.value))}
                className={inputClass}
                min="0"
                placeholder="e.g. 1500"
              />
            </div>
          </div>
        </div>

        {/* Visual Preferences */}
        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Palette className="h-5 w-5 text-emerald-400" />
            Theme & Visual Preferences
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">Choose a workspace theme</p>
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                role="radiogroup"
                aria-label="Workspace theme"
              >
                {themes.map((mode) => {
                  const selected = form.backgroundMode === mode.value;
                  const Icon = mode.Icon;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      data-testid={`theme-choice-${mode.value}`}
                      onClick={() => selectBackgroundMode(mode.value)}
                      className={`theme-choice ${selected ? 'is-selected' : ''}`}
                    >
                      <span className={`theme-choice-preview ${mode.preview}`} aria-hidden="true"><Icon /></span>
                      <span className="theme-choice-copy"><span className="theme-choice-title">{mode.label}</span><span className="theme-choice-description">{mode.description}</span></span>
                      {selected && <Check className="theme-choice-check" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {form.backgroundMode === 'random-color' && (
              <div className="palette-picker">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Accent palette</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Current: {palettes.find((p) => p.value === form.accentPalette)?.label || 'Lagoon'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {palettes.map((palette) => <button type="button" key={palette.value} onClick={() => { setForm((p) => ({ ...p, accentPalette: palette.value })); updateSettings({ accentPalette: palette.value }); }} aria-pressed={form.accentPalette === palette.value} className={`palette-swatch swatch-${palette.value}`} aria-label={`${palette.label} accent palette`} title={palette.label} />)}
                  <button type="button" className="button-secondary flex items-center gap-2" onClick={shufflePalette}><Shuffle className="h-4 w-4" /> Shuffle</button>
                </div>
              </div>
            )}
            <div className="theme-note">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Your theme is applied across every page and saved in this browser. Galaxy uses a locally rendered, reduced-motion-aware atmosphere; no media is loaded.
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Info className="h-5 w-5 text-amber-400" />
            About This Application
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              <span className="font-medium text-white">Digital Library Management System</span> — Version 1 (Frontend Preview)
            </p>
            <p>
              A complete, interactive frontend prototype for managing a physical study library. Includes student registration, seat allocation, fee tracking, payment history, and reports — all powered by in-memory demo data.
            </p>
            <p>
              Version 2 will introduce secure authentication, a real database, server-side validation, and persistent records. No data is permanently stored in this version.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-white/5 bg-white/5 p-3 text-center">
                <p className="text-xs text-slate-500">Version</p>
                <p className="text-sm font-medium text-white">1.0.0</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3 text-center">
                <p className="text-xs text-slate-500">Type</p>
                <p className="text-sm font-medium text-white">Frontend</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3 text-center">
                <p className="text-xs text-slate-500">Stack</p>
                <p className="text-sm font-medium text-white">React + Vite</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3 text-center">
                <p className="text-xs text-slate-500">Deploy</p>
                <p className="text-sm font-medium text-white">Vercel Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          {saved && (
            <span className="text-sm text-emerald-300">Settings saved for this session</span>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Theme and accent choices are saved in this browser. Library settings and demo data remain in session memory only.
        </p>
      </div>
    </div>
  );
}
