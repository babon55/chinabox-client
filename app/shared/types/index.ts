// ── Language ──────────────────────────────────────────────────
export type Lang = 'tk' | 'ru'

export const LANGS: Record<Lang, { flag: string; label: string }> = {
  tk: { flag: '🇹🇲', label: 'TK' },
  ru: { flag: '🇷🇺', label: 'RU' },
}

// ── Generic helpers ───────────────────────────────────────────
export type LocalizedString = Record<Lang, string>

export interface SelectOption {
  value: string
  label: LocalizedString
} 