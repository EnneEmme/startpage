/**
 * DataStore Engine
 * Handles links configuration, category grouping, dynamic link rules, and localStorage persistence.
 */

import { LinkItem, CategoryGroup, StartpageConfig } from '../types/startpage';

const STORAGE_LINKS_KEY = 'startpage_custom_links';

export const DEFAULT_CONFIG: StartpageConfig = {
  defaultSearchEngine: 'g',
  commands: [
    // Social / Communication
    { id: 'mail', title: 'Gmail', url: 'https://mail.google.com/mail/u/0/#inbox', aliases: ['m', 'gmail', 'mail'], category: 'Social', icon: 'Mail', color: 'linear-gradient(135deg, #dd5145, #dd5145)' },
    { id: 'telegram', title: 'Telegram', url: 'https://web.telegram.org', aliases: ['tg', 'telegram'], category: 'Social', icon: 'Send', color: '#5682a3' },
    { id: 'whatsapp', title: 'WhatsApp', url: 'https://web.whatsapp.com', aliases: ['w', 'wa', 'whatsapp'], category: 'Social', icon: 'MessageCircle', color: '#25D366' },
    { id: 'discord', title: 'Discord', url: 'https://discord.com/app', aliases: ['ds', 'discord'], category: 'Social', icon: 'MessageSquare', color: '#7289da' },
    { id: 'instagram', title: 'Instagram', url: 'https://www.instagram.com', aliases: ['i', 'ig', 'insta'], category: 'Social', icon: 'Instagram', color: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)' },
    { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', aliases: ['r', 'reddit'], category: 'Social', icon: 'Globe', color: '#FF4500' },

    // Fun / Entertainment
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', aliases: ['y', 'yt', 'youtube'], category: 'Fun', icon: 'Youtube', color: '#cd201f' },
    { id: 'twitch', title: 'Twitch', url: 'https://www.twitch.tv', aliases: ['t', 'twitch'], category: 'Fun', icon: 'Tv', color: '#6441a5' },
    { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com/', aliases: ['s', 'spotify', 'music'], category: 'Fun', icon: 'Music', color: '#1dd35e' },
    { id: 'crunchyroll', title: 'Crunchyroll', url: 'https://www.crunchyroll.com/it/', aliases: ['cr', 'anime'], category: 'Fun', icon: 'Film', color: '#FF8456' },
    { id: 'justwatch', title: 'JustWatch', url: 'https://www.justwatch.com', aliases: ['jw', 'movies'], category: 'Fun', icon: 'Search', color: '#FF8456' },

    // AI & Dev
    { id: 'aistudio', title: 'Google AI Studio', url: 'https://aistudio.google.com/prompts/new_chat', aliases: ['aistudio', 'studio'], category: 'LLMs', icon: 'Sparkles', color: '#5D81E6' },
    { id: 'gemini', title: 'Google Gemini', url: 'https://gemini.google.com/app', aliases: ['gem', 'gemini'], category: 'LLMs', icon: 'Bot', color: '#5D81E6' },
    { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', aliases: ['gpt', 'chatgpt'], category: 'LLMs', icon: 'MessageSquareText', color: '#10a37f' },
    { id: 'claude', title: 'Claude AI', url: 'https://claude.ai', aliases: ['claude', 'anthropic'], category: 'LLMs', icon: 'Cpu', color: '#d97757' },
    { id: 'mistral', title: 'Mistral AI', url: 'https://chat.mistral.ai/chat', aliases: ['mistral'], category: 'LLMs', icon: 'Zap', color: '#ff7000' },
    { id: 'grok', title: 'Grok', url: 'https://grok.com', aliases: ['grok', 'xai'], category: 'LLMs', icon: 'Terminal', color: '#000000' },
    { id: 'openrouter', title: 'OpenRouter', url: 'https://openrouter.ai/chat', aliases: ['openrouter'], category: 'LLMs', icon: 'Share2', color: '#6366f1' },

    // Dynamic University Links (Unimib)
    { id: 'unimib_orari', title: 'Unimib Orario Lezioni', url: '', aliases: ['orari', 'unimib_orari', 'lezioni'], category: 'University', icon: 'Calendar', dynamicUrlRule: 'unimib_orari', color: '#003366' },
    { id: 'unimib_esami', title: 'Unimib Appelli Esami', url: '', aliases: ['esami', 'unimib_esami', 'appelli'], category: 'University', icon: 'FileText', dynamicUrlRule: 'unimib_esami', color: '#003366' }
  ]
};

export class DataStore {
  private config: StartpageConfig = DEFAULT_CONFIG;

  constructor() {
    this.load();
  }

  public load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_LINKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.commands)) {
          this.config = parsed;
          return;
        }
      }
    } catch {}
    this.config = DEFAULT_CONFIG;
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(this.config));
    } catch (err) {
      console.warn('Failed to save links to localStorage:', err);
    }
  }

  public getLinks(): LinkItem[] {
    return [...this.config.commands];
  }

  public getCategories(): CategoryGroup[] {
    const groupsMap: Record<string, LinkItem[]> = {};

    this.config.commands.forEach(link => {
      const cat = link.category || 'General';
      if (!groupsMap[cat]) {
        groupsMap[cat] = [];
      }
      groupsMap[cat].push(link);
    });

    return Object.keys(groupsMap).map(categoryName => ({
      name: categoryName,
      links: groupsMap[categoryName]
    }));
  }

  public addLink(link: LinkItem): void {
    // Remove existing if matching ID
    this.config.commands = this.config.commands.filter(l => l.id !== link.id);
    this.config.commands.push(link);
    this.save();
  }

  public removeLink(linkId: string): void {
    this.config.commands = this.config.commands.filter(l => l.id !== linkId);
    this.save();
  }

  public exportJson(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.commands)) {
        this.config = parsed;
        this.save();
        return true;
      }
    } catch {}
    return false;
  }

  public resetToDefault(): void {
    this.config = DEFAULT_CONFIG;
    try {
      localStorage.removeItem(STORAGE_LINKS_KEY);
    } catch {}
  }
}

export const dataStore = new DataStore();
