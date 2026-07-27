/**
 * Theme & Accent Color Customization Engine
 * Manages dynamic CSS variables on :root and persists user preferences in localStorage.
 */

export interface ThemeConfig {
  accentColorId: string;
  gridDensity: 'compact' | 'normal' | 'spaced';
  fontSize: 'small' | 'medium' | 'large';
  defaultSearchEngine: 'g' | 'ddg' | 'b' | 'yt' | 'gh';
}

export interface AccentColorOption {
  id: string;
  name: string;
  primary: string;
  highlight: string;
  glow: string;
  borderHover: string;
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: 'silver',
    name: 'Silver Platinum',
    primary: '#e2e8f0',
    highlight: '#f8fafc',
    glow: 'rgba(226, 232, 240, 0.18)',
    borderHover: 'rgba(226, 232, 240, 0.4)'
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    primary: '#10b981',
    highlight: '#34d399',
    glow: 'rgba(16, 185, 129, 0.18)',
    borderHover: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'sapphire',
    name: 'Sapphire Blue',
    primary: '#3b82f6',
    highlight: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.18)',
    borderHover: 'rgba(59, 130, 246, 0.4)'
  },
  {
    id: 'violet',
    name: 'Cyberpunk Violet',
    primary: '#8b5cf6',
    highlight: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.18)',
    borderHover: 'rgba(139, 92, 246, 0.4)'
  },
  {
    id: 'amber',
    name: 'Sunset Gold',
    primary: '#f59e0b',
    highlight: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.18)',
    borderHover: 'rgba(245, 158, 11, 0.4)'
  },
  {
    id: 'rose',
    name: 'Rose Coral',
    primary: '#f43f5e',
    highlight: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.18)',
    borderHover: 'rgba(244, 63, 94, 0.4)'
  }
];

const STORAGE_KEY = 'startpage_theme_settings';

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  accentColorId: 'silver', // Default accent is silver/platinum gray
  gridDensity: 'normal',   // Default density is balanced 185px
  fontSize: 'medium',      // Default font size is medium
  defaultSearchEngine: 'g'
};

export class ThemeEngine {
  private config: ThemeConfig;

  constructor() {
    this.config = this.loadConfig();
    this.applyTheme(this.config);
  }

  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  public setAccentColor(accentId: string): void {
    const selected = ACCENT_COLORS.find(c => c.id === accentId);
    if (!selected) return;

    this.config.accentColorId = accentId;
    this.saveAndApply();
  }

  public setGridDensity(density: 'compact' | 'normal' | 'spaced'): void {
    this.config.gridDensity = density;
    this.saveAndApply();
  }

  public setFontSize(size: 'small' | 'medium' | 'large'): void {
    this.config.fontSize = size;
    this.saveAndApply();
  }

  public setDefaultSearchEngine(engine: 'g' | 'ddg' | 'b' | 'yt' | 'gh'): void {
    this.config.defaultSearchEngine = engine;
    this.saveAndApply();
  }

  public updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveAndApply();
  }

  public applyTheme(config: ThemeConfig): void {
    if (typeof document === 'undefined') return;

    const accent = ACCENT_COLORS.find(c => c.id === config.accentColorId) || ACCENT_COLORS[0];
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', accent.primary);
    root.style.setProperty('--accent-highlight', accent.highlight);
    root.style.setProperty('--accent-glow', accent.glow);
    root.style.setProperty('--border-color-hover', accent.borderHover);

    // Apply 3-tier grid density scale
    let minColWidth = '185px';      // DEFAULT ('normal')
    let gridGap = '5rem 1.25rem';
    let linkPadding = '0.34rem 0.45rem';

    if (config.gridDensity === 'compact') {
      minColWidth = '155px';       // ULTRA COMPACT
      gridGap = '4.5rem 0.85rem';
      linkPadding = '0.26rem 0.38rem';
    } else if (config.gridDensity === 'spaced') {
      minColWidth = '230px';       // WIDE / SPACED
      gridGap = '6rem 1.8rem';
      linkPadding = '0.45rem 0.6rem';
    }

    root.style.setProperty('--grid-col-min-width', minColWidth);
    root.style.setProperty('--grid-gap', gridGap);
    root.style.setProperty('--link-row-padding', linkPadding);

    // Apply Font Size scaling
    let baseSize = '1rem';
    let linkSize = '0.88rem';
    let headerSize = '1.05rem';
    let badgeSize = '0.68rem';

    if (config.fontSize === 'small') {
      baseSize = '0.92rem';
      linkSize = '0.80rem';
      headerSize = '0.95rem';
      badgeSize = '0.62rem';
    } else if (config.fontSize === 'large') {
      baseSize = '1.1rem';
      linkSize = '0.98rem';
      headerSize = '1.18rem';
      badgeSize = '0.76rem';
    }

    root.style.setProperty('--font-size-base', baseSize);
    root.style.setProperty('--font-size-link', linkSize);
    root.style.setProperty('--font-size-header', headerSize);
    root.style.setProperty('--font-size-badge', badgeSize);
  }

  private saveAndApply(): void {
    this.saveConfig(this.config);
    this.applyTheme(this.config);
  }

  private loadConfig(): ThemeConfig {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_THEME_CONFIG;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_THEME_CONFIG, ...parsed };
    } catch {
      return DEFAULT_THEME_CONFIG;
    }
  }

  private saveConfig(config: ThemeConfig): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore quota storage issues
    }
  }
}

export const themeEngine = new ThemeEngine();
