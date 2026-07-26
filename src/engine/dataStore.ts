/**
 * DataStore Engine
 * Handles links configuration, category grouping, dynamic link rules, and localStorage persistence.
 * Includes complete 1-to-1 migration of all legacy links from config.js and ai-config.js.
 */

import { LinkItem, CategoryGroup, StartpageConfig } from '../types/startpage';

const STORAGE_LINKS_KEY = 'startpage_custom_links';

export const DEFAULT_CONFIG: StartpageConfig = {
  defaultSearchEngine: 'g',
  commands: [
    // Social
    { id: 'mail', title: 'Mail', url: 'https://mail.google.com/mail/u/0/#inbox', aliases: ['m', 'gmail', 'mail'], category: 'Social' },
    { id: 'instagram', title: 'Instagram', url: 'https://www.instagram.com', aliases: ['i', 'ig', 'insta'], category: 'Social' },
    { id: 'tiktok', title: 'TikTok', url: 'https://www.tiktok.com/it-IT', aliases: ['tt', 'tiktok'], category: 'Social' },
    { id: 'telegram', title: 'Telegram', url: 'https://web.telegram.org', aliases: ['tg', 'telegram'], category: 'Social' },
    { id: 'whatsapp', title: 'WhatsApp', url: 'https://web.whatsapp.com', aliases: ['w', 'wa', 'whatsapp'], category: 'Social' },
    { id: 'discord', title: 'Discord', url: 'https://discord.com/app', aliases: ['ds', 'discord'], category: 'Social' },
    { id: 'twitter', title: 'Twitter', url: 'https://www.twitter.com', aliases: ['x', 'twitter'], category: 'Social' },
    { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', aliases: ['r', 'reddit'], category: 'Social' },
    { id: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com', aliases: ['l', 'linkedin'], category: 'Social' },

    // Fun
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', aliases: ['y', 'yt', 'youtube'], category: 'Fun' },
    { id: 'twitch', title: 'Twitch', url: 'https://www.twitch.tv', aliases: ['t', 'twitch'], category: 'Fun' },
    { id: 'primevideo', title: 'Prime Video', url: 'https://www.primevideo.com', aliases: ['p', 'prime'], category: 'Fun' },
    { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com/', aliases: ['s', 'spotify', 'music'], category: 'Fun' },
    { id: 'crunchyroll', title: 'Crunchyroll', url: 'https://www.crunchyroll.com/it/', aliases: ['cr', 'anime'], category: 'Fun' },
    { id: 'justwatch', title: 'JustWatch', url: 'https://www.justwatch.com', aliases: ['jw', 'movies'], category: 'Fun' },
    { id: 'imdb', title: 'IMDB', url: 'https://imdb.com', aliases: ['imdb'], category: 'Fun' },
    { id: 'simkl', title: 'Simkl', url: 'https://simkl.com/8617331/dashboard/', aliases: ['tv', 'simkl'], category: 'Fun' },
    { id: 'go', title: 'Go Online', url: 'https://online-go.com', aliases: ['go'], category: 'Fun' },
    { id: 'chess', title: 'Chess.com', url: 'https://www.chess.com/home', aliases: ['c', 'chess'], category: 'Fun' },
    { id: 'lichess', title: 'Lichess', url: 'https://lichess.org', aliases: ['lichess'], category: 'Fun' },
    { id: 'chessreview', title: 'Chess Review', url: 'https://chess.wintrcat.uk', aliases: ['chessreview'], category: 'Fun' },
    { id: 'sudokude', title: 'Sudoku de', url: 'https://logic-masters.de/Raetselportal/index.php', aliases: ['sude'], category: 'Fun' },
    { id: 'sudokucoach', title: 'SudokuCoach', url: 'https://sudoku.coach', aliases: ['suco'], category: 'Fun' },

    // Reading & News
    { id: 'medium', title: 'Medium', url: 'https://medium.com', aliases: ['medium'], category: 'Reading & News' },
    { id: 'arxiv', title: 'Arxiv', url: 'https://arxiv.org', aliases: ['arxiv'], category: 'Reading & News' },
    { id: 'jair', title: 'Jair', url: 'https://www.jair.org/index.php/jair/index', aliases: ['jair'], category: 'Reading & News' },
    { id: 'quantamagazine', title: 'Quanta Magazine', url: 'https://www.quantamagazine.org/', aliases: ['quanta'], category: 'Reading & News' },
    { id: 'scientificamerican', title: 'Scientific American', url: 'https://www.scientificamerican.com/#', aliases: ['sci'], category: 'Reading & News' },
    { id: 'theguardian', title: 'The Guardian', url: 'https://www.theguardian.com/technology/all', aliases: ['guardian'], category: 'Reading & News' },
    { id: 'nature', title: 'Nature', url: 'https://www.nature.com', aliases: ['nature'], category: 'Reading & News' },
    { id: 'theverge', title: 'The Verge', url: 'https://www.theverge.com', aliases: ['verge'], category: 'Reading & News' },
    { id: 'devto', title: 'Dev.to', url: 'https://dev.to', aliases: ['devto'], category: 'Reading & News' },
    { id: 'tldr', title: 'TLDR Tech', url: 'https://tldr.tech', aliases: ['tldr'], category: 'Reading & News' },
    { id: 'unwindai', title: 'Unwind AI', url: 'https://www.theunwindai.com', aliases: ['unwind'], category: 'Reading & News' },
    { id: 'hackernews', title: 'Hacker News', url: 'https://news.ycombinator.com/', aliases: ['hn', 'hackernews'], category: 'Reading & News' },

    // School / University (Unimib)
    { id: 'school_mail', title: 'School Mail', url: 'https://mail.google.com/mail/u/1/#inbox', aliases: ['wm', 'schoolmail'], category: 'School' },
    { id: 'school_drive', title: 'School Drive', url: 'https://drive.google.com/drive/u/1/my-drive', aliases: ['wd', 'schooldrive'], category: 'School' },
    { id: 'segreteria', title: 'Segreteria Unimib', url: 'https://s3w.si.unimib.it/auth/studente/HomePageStudente.do', aliases: ['segreteria'], category: 'School' },
    { id: 'unimib_esami', title: 'Appelli Esami', url: '', aliases: ['esami', 'unimib_esami', 'appelli'], category: 'School', dynamicUrlRule: 'unimib_esami' },
    { id: 'unimib_orari', title: 'Orario Lezioni', url: '', aliases: ['orari', 'unimib_orari', 'lezioni'], category: 'School', dynamicUrlRule: 'unimib_orari' },
    { id: 'appunti', title: 'Appunti Mega', url: 'https://mega.nz/folder/4bUhDBzA#EkBRNE5HKmguMammZohU6g/folder/9b8wlKQa', aliases: ['app', 'appunti'], category: 'School' },
    { id: 'aml', title: 'AML Elearning', url: 'https://elearning.unimib.it/enrol/index.php?id=68868', aliases: ['metodiscie', 'aml'], category: 'School' },
    { id: 'ai_course', title: 'AI Elearning', url: 'https://elearning.unimib.it/enrol/index.php?id=68862', aliases: ['ai_course'], category: 'School' },
    { id: 'crv', title: 'CRV Elearning', url: 'https://elearning.unimib.it/enrol/index.php?id=68849', aliases: ['crv'], category: 'School' },
    { id: 'vipm', title: 'VIPM Elearning', url: 'https://elearning.unimib.it/enrol/index.php?id=68845', aliases: ['vipm'], category: 'School' },
    { id: 'info_course', title: 'Info Elearning', url: 'https://elearning.unimib.it/course/view.php?id=62130', aliases: ['info_course'], category: 'School' },

    // AI & LLMs (All entries from config.js & ai-config.js)
    { id: 'aistudio', title: 'Google AI Studio', url: 'https://aistudio.google.com/prompts/new_chat', aliases: ['aistudio', 'studio'], category: 'AI & LLMs' },
    { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com/app', aliases: ['gem', 'gemini'], category: 'AI & LLMs' },
    { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', aliases: ['gpt', 'chatgpt'], category: 'AI & LLMs' },
    { id: 'claude', title: 'Claude AI', url: 'https://claude.ai', aliases: ['claude', 'anthropic'], category: 'AI & LLMs' },
    { id: 'mistral', title: 'Mistral AI', url: 'https://chat.mistral.ai/chat', aliases: ['mistral'], category: 'AI & LLMs' },
    { id: 'grok', title: 'Grok', url: 'https://grok.com', aliases: ['grok', 'xai'], category: 'AI & LLMs' },
    { id: 'notebooklm', title: 'NotebookLM', url: 'https://notebooklm.google.com', aliases: ['notebook', 'notebooklm'], category: 'AI & LLMs' },
    { id: 'openrouter', title: 'OpenRouter', url: 'https://openrouter.ai/chat', aliases: ['openrouter'], category: 'AI & LLMs' },
    { id: 'perplexity', title: 'Perplexity AI', url: 'https://www.perplexity.ai', aliases: ['perple', 'perplexity'], category: 'AI & LLMs' },
    { id: 'meta_ai', title: 'Meta AI', url: 'https://www.meta.ai', aliases: ['meta'], category: 'AI & LLMs' },
    { id: 'deepseek', title: 'DeepSeek', url: 'https://chat.deepseek.com', aliases: ['deepseek'], category: 'AI & LLMs' },
    { id: 'qwen', title: 'Qwen AI', url: 'https://chat.qwen.ai', aliases: ['qwen'], category: 'AI & LLMs' },
    { id: 'kimi', title: 'Kimi AI', url: 'https://www.kimi.com', aliases: ['kimi'], category: 'AI & LLMs' },
    { id: 'zai', title: 'Z.AI Chat', url: 'https://chat.z.ai', aliases: ['zai'], category: 'AI & LLMs' },
    { id: 'minimax', title: 'Minimax AI', url: 'https://agent.minimax.io', aliases: ['minimax'], category: 'AI & LLMs' },
    { id: 't3chat', title: 'T3 Chat', url: 'https://t3.chat', aliases: ['t3chat'], category: 'AI & LLMs' },
    { id: 'lmarena', title: 'LM Arena', url: 'https://lmarena.ai', aliases: ['lmarena', 'arena'], category: 'AI & LLMs' },
    { id: 'cohere', title: 'Cohere Playground', url: 'https://dashboard.cohere.com/playground/chat', aliases: ['cohere'], category: 'AI & LLMs' },
    { id: 'inceptionlabs', title: 'InceptionLabs', url: 'https://chat.inceptionlabs.ai', aliases: ['inceptionlabs'], category: 'AI & LLMs' },
    { id: 'llmstats', title: 'LLM Stats', url: 'https://llm-stats.com/leaderboards/llm-leaderboard', aliases: ['llmstats'], category: 'AI & LLMs' },
    { id: 'artificialanalysis', title: 'Artificial Analysis', url: 'https://artificialanalysis.ai', aliases: ['analysis'], category: 'AI & LLMs' },

    // LLMs 2 & Specialized AI
    { id: 'stepfun', title: 'StepFun AI', url: 'https://stepfun.ai/chats/new', aliases: ['stepfun'], category: 'LLMs 2' },
    { id: 'upstage', title: 'Upstage AI', url: 'https://console.upstage.ai/playground/chat', aliases: ['upstage'], category: 'LLMs 2' },
    { id: 'arcee', title: 'Arcee AI', url: 'https://chat.arcee.ai/chat', aliases: ['arcee'], category: 'LLMs 2' },
    { id: 'liquid', title: 'Liquid AI', url: 'https://playground.liquid.ai/chat', aliases: ['liquid'], category: 'LLMs 2' },
    { id: 'k2think', title: 'K2 Think', url: 'https://www.k2think.ai', aliases: ['k2think'], category: 'LLMs 2' },
    { id: 'cloudflare_ai', title: 'Cloudflare AI Playground', url: 'https://playground.ai.cloudflare.com/', aliases: ['playground_cloudflare'], category: 'LLMs 2' },
    { id: 'ernie', title: 'Baidu Ernie', url: 'https://ernie.baidu.com', aliases: ['ernie'], category: 'LLMs 2' },
    { id: 'longcat', title: 'Longcat AI', url: 'https://longcat.chat', aliases: ['longcat'], category: 'LLMs 2' },
    { id: 'byteplus', title: 'BytePlus AI', url: 'https://www.byteplus.com/en/ai-playground/chat', aliases: ['byteplus'], category: 'LLMs 2' },
    { id: 'sarvam', title: 'Sarvam AI', url: 'https://dashboard.sarvam.ai/chat', aliases: ['sarvam'], category: 'LLMs 2' },
    { id: 'jamba', title: 'AI21 Jamba', url: 'https://studio.ai21.com/v2/workspaces', aliases: ['jamba'], category: 'LLMs 2' },
    { id: 'tinker', title: 'Tinker Machines', url: 'https://tinker.thinkingmachines.ai/playground', aliases: ['tinker'], category: 'LLMs 2' },
    { id: 'motiftech', title: 'Motif Tech', url: 'https://chat.motiftech.io/chat', aliases: ['motiftech'], category: 'LLMs 2' },

    // Programming
    { id: 'github', title: 'GitHub', url: 'https://github.com', aliases: ['g', 'gh', 'github'], category: 'Programming' },
    { id: 'leetcode', title: 'LeetCode', url: 'https://leetcode.com/problemset/all/', aliases: ['leetcode'], category: 'Programming' },
    { id: 'paperswithcode', title: 'PapersWithCode', url: 'https://paperswithcode.com', aliases: ['pcode', 'paperswithcode'], category: 'Programming' },
    { id: 'huggingface', title: 'HuggingFace', url: 'https://huggingface.co', aliases: ['hug', 'huggingface'], category: 'Programming' },
    { id: 'kaggle', title: 'Kaggle', url: 'https://www.kaggle.com', aliases: ['kaggle'], category: 'Programming' },
    { id: 'roboflow', title: 'Roboflow', url: 'https://app.roboflow.com/', aliases: ['roboflow'], category: 'Programming' },
    { id: 'producthunt', title: 'Product Hunt', url: 'https://www.producthunt.com', aliases: ['producthunt'], category: 'Programming' },
    { id: 'penpot', title: 'Penpot Design', url: 'https://design.penpot.app', aliases: ['penpot'], category: 'Programming' },
    { id: 'codewars', title: 'Codewars', url: 'https://www.codewars.com/dashboard', aliases: ['codewars'], category: 'Programming' },

    // ImGen & AudioGen Media
    { id: 'recraft', title: 'Recraft AI', url: 'https://www.recraft.ai/projects', aliases: ['recraft'], category: 'ImGen & Media' },
    { id: 'ideogram', title: 'Ideogram AI', url: 'https://ideogram.ai/t/explore', aliases: ['ideogram'], category: 'ImGen & Media' },
    { id: 'kling', title: 'Kling AI', url: 'https://kling.ai/app', aliases: ['kling'], category: 'ImGen & Media' },
    { id: 'leonardo', title: 'Leonardo AI', url: 'https://app.leonardo.ai', aliases: ['leo', 'leonardo'], category: 'ImGen & Media' },
    { id: 'stablediffusion', title: 'Stable Diffusion', url: 'https://stablediffusionweb.com/app/image-generator', aliases: ['sd', 'stablediffusion'], category: 'ImGen & Media' },
    { id: 'getimg', title: 'getimg.ai', url: 'https://getimg.ai/home', aliases: ['getimg'], category: 'ImGen & Media' },
    { id: 'quiver', title: 'Quiver AI', url: 'https://app.quiver.ai/', aliases: ['quieverai'], category: 'ImGen & Media' },
    { id: 'krea', title: 'Krea AI', url: 'https://www.krea.ai/app', aliases: ['krea'], category: 'ImGen & Media' },
    { id: 'suno', title: 'Suno AI', url: 'https://suno.com', aliases: ['suno'], category: 'ImGen & Media' },
    { id: 'elevenlabs', title: 'ElevenLabs', url: 'https://elevenlabs.io/app/home', aliases: ['audiogen', 'elevenlabs'], category: 'ImGen & Media' }
  ]
};

const cloneConfig = (config: StartpageConfig): StartpageConfig => {
  return JSON.parse(JSON.stringify(config));
};

export class DataStore {
  private config: StartpageConfig = cloneConfig(DEFAULT_CONFIG);

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
    this.config = cloneConfig(DEFAULT_CONFIG);
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
    this.config = cloneConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem(STORAGE_LINKS_KEY);
    } catch {}
  }
}

export const dataStore = new DataStore();
