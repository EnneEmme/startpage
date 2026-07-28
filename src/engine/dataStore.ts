/**
 * DataStore Engine
 * Handles links configuration, category grouping, custom category ordering, category renaming, precise link reordering/insertion, dynamic link rules, and localStorage persistence.
 */

import type { LinkItem, CategoryGroup, StartpageConfig } from '../types/startpage';

const STORAGE_LINKS_KEY = 'startpage_custom_links';
const STORAGE_ORDER_KEY = 'startpage_category_order';

export const ORARI_SCRIPT = `(function() {
  var parseDate = function(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  };
  var today = parseDate(new Date());
  var url = "https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easycourse&form-type=corso&include=corso&txtcurr=1+-+PERCORSO+COMUNE&anno=2025&scuola=&corso=F1802Q&anno2%5B%5D=GGG%7C1&visualizzazione_orario=cal&date=" + today + "&periodo_didattico=&_lang=it&list=&week_grid_type=-1&ar_codes_=EC508261%7CEC512923%7CEC508282%7CEC512924%7CEC509735&ar_select_=true%7Ctrue%7Ctrue%7Ctrue%7Cfalse&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#";
  window.location.href = url;
})();`;

export const ESAMI_SCRIPT = `(function() {
  var parseDate = function(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  };
  var today = new Date();
  var date = new Date(today);
  date.setDate(date.getDate() + 60);
  var todayStr = parseDate(today);
  var dateStr = parseDate(date);
  var url = "https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easytest&form-type=et_cdl&include=et_cdl&et_er=1&scuola=AreaScientifica-Informatica&esami_cdl=F1802Q&anno2%5B%5D=1&datefrom=" + todayStr + "&dateto=" + dateStr + "&_lang=it&list=&week_grid_type=-1&ar_codes_=&ar_select_=&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#";
  window.location.href = url;
})();`;

export const DEFAULT_CONFIG: StartpageConfig = {
  defaultSearchEngine: 'g',
  commands: [
    // Social
    { id: 'mail', title: 'Mail', url: 'https://mail.google.com/mail/u/0/#inbox', aliases: ['m', 'mail', 'gmail'], category: 'Social', searchPath: '/#search/text={}' },
    { id: 'instagram', title: 'Instagram', url: 'https://www.instagram.com', aliases: ['i', 'ig', 'insta'], category: 'Social' },
    { id: 'tiktok', title: 'tiktok', url: 'https://www.tiktok.com/it-IT', aliases: ['tt', 'tiktok'], category: 'Social', searchPath: '/search?q={}' },
    { id: 'telegram', title: 'Telegram', url: 'https://web.telegram.org', aliases: ['tg', 'telegram'], category: 'Social' },
    { id: 'whatsapp', title: 'WhatsApp', url: 'https://web.whatsapp.com', aliases: ['w', 'wa', 'whatsapp'], category: 'Social' },
    { id: 'discord', title: 'Discord', url: 'https://discord.com/app', aliases: ['ds', 'discord'], category: 'Social' },
    { id: 'twitter', title: 'Twitter', url: 'https://www.twitter.com', aliases: ['x', 'twitter'], category: 'Social', searchPath: '/search?q={}&src=typed_query' },
    { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', aliases: ['r', 'reddit'], category: 'Social', searchPath: '/search?q={}' },
    { id: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com', aliases: ['l', 'linkedin'], category: 'Social', searchPath: '/search/results/all/?keywords={}' },

    // Fun
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', aliases: ['y', 'yt', 'youtube'], category: 'Fun', searchPath: '/results?search_query={}' },
    { id: 'twitch', title: 'Twitch', url: 'https://www.twitch.tv', aliases: ['t', 'twitch'], category: 'Fun', searchPath: '/directory/game/{}' },
    { id: 'primevideo', title: 'Prime Video', url: 'https://www.primevideo.com', aliases: ['p', 'prime'], category: 'Fun', searchPath: '/region/eu/search/ref=atv_nb_sug?ie=UTF8&phrase={}' },
    { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com/', aliases: ['s', 'spotify'], category: 'Fun', searchPath: '/search/{}' },
    { id: 'crunchyroll', title: 'Crunchyroll', url: 'https://www.crunchyroll.com/it/', aliases: ['cr', 'crunchyroll'], category: 'Fun', searchPath: '/search?q={}' },
    { id: 'justwatch', title: 'JustWatch', url: 'https://www.justwatch.com', aliases: ['jw', 'justwatch'], category: 'Fun', searchPath: '/it/cerca?q={}' },
    { id: 'imdb', title: 'IMDB', url: 'https://imdb.com', aliases: ['imdb'], category: 'Fun', searchPath: '/find/?q={}' },
    { id: 'simkl', title: 'simkl', url: 'https://simkl.com/8617331/dashboard/', aliases: ['tv', 'simkl'], category: 'Fun' },
    { id: 'go', title: 'Go', url: 'https://online-go.com', aliases: ['go'], category: 'Fun' },
    { id: 'chess', title: 'Chess', url: 'https://www.chess.com/home', aliases: ['c', 'chess'], category: 'Fun' },
    { id: 'lichess', title: 'Lichess', url: 'https://lichess.org', aliases: ['lichess'], category: 'Fun' },
    { id: 'chessreview', title: 'Chess Review', url: 'https://chess.wintrcat.uk', aliases: ['chessreview'], category: 'Fun' },
    { id: 'sudokude', title: 'Sudoku de', url: 'https://logic-masters.de/Raetselportal/index.php', aliases: ['sude', 'sudokude'], category: 'Fun' },
    { id: 'sudokucoach', title: 'SudokuCoach', url: 'https://sudoku.coach', aliases: ['suco', 'sudokucoach'], category: 'Fun' },
    { id: 'epicgames', title: 'epicgames', url: 'https://store.epicgames.com/en-US/', aliases: ['epic', 'epicgames'], category: 'Fun' },

    // Reading & News
    { id: 'medium', title: 'Medium', url: 'https://medium.com', aliases: ['medium'], category: 'Reading & News' },
    { id: 'arxiv', title: 'Arxiv', url: 'https://arxiv.org', aliases: ['arxiv'], category: 'Reading & News', searchPath: '/search/?query={}&searchtype=all&source=header' },
    { id: 'jair', title: 'Jair', url: 'https://www.jair.org/index.php/jair/index', aliases: ['jair'], category: 'Reading & News' },
    { id: 'quantamagazine', title: 'Quantamagazine', url: 'https://www.quantamagazine.org/', aliases: ['quanta', 'quantamagazine'], category: 'Reading & News' },
    { id: 'scientificamerican', title: 'ScentificAmerica', url: 'https://www.scientificamerican.com/#', aliases: ['scientificamerican'], category: 'Reading & News' },
    { id: 'theguardian', title: 'The Guardian', url: 'https://www.theguardian.com/technology/all', aliases: ['guardian', 'theguardian'], category: 'Reading & News' },
    { id: 'nature', title: 'Nature', url: 'https://www.nature.com', aliases: ['nature'], category: 'Reading & News' },
    { id: 'theverge', title: 'Theverge', url: 'https://www.theverge.com', aliases: ['verge', 'theverge'], category: 'Reading & News', searchPath: '/search?q={}' },
    { id: 'devto', title: 'Dev.to', url: 'https://dev.to', aliases: ['devto'], category: 'Reading & News', searchPath: '/search?utf8=✓&q={}' },
    { id: 'tldr', title: 'tldr', url: 'https://tldr.tech', aliases: ['tldr'], category: 'Reading & News' },
    { id: 'unwindai', title: 'Unwind AI', url: 'https://www.theunwindai.com', aliases: ['unwindai'], category: 'Reading & News' },
    { id: 'hackernews', title: 'Hacker News', url: 'https://news.ycombinator.com/', aliases: ['hn', 'hackernews'], category: 'Reading & News', searchPath: '/search?q={}' },

    // School / University (Unimib)
    { id: 'school_mail', title: 'Mail', url: 'https://mail.google.com/mail/u/1/#inbox', aliases: ['wm', 'schoolmail'], category: 'School', searchPath: '/#search/text={}' },
    { id: 'school_drive', title: 'Drive', url: 'https://drive.google.com/drive/u/1/my-drive', aliases: ['wd', 'schooldrive'], category: 'School', searchPath: '/drive/search?q={}' },
    { id: 'segreteria', title: 'Segreteria', url: 'https://s3w.si.unimib.it/auth/studente/HomePageStudente.do', aliases: ['segreteria'], category: 'School' },
    { id: 'unimib_esami', title: 'Esami', url: 'javascript:updateEsami()', aliases: ['esami', 'unimib_esami'], category: 'School', dynamicUrlRule: 'unimib_esami', isScript: true, scriptContent: ESAMI_SCRIPT },
    { id: 'unimib_orari', title: 'Orari', url: 'javascript:updateOrari()', aliases: ['orari', 'unimib_orari'], category: 'School', dynamicUrlRule: 'unimib_orari', isScript: true, scriptContent: ORARI_SCRIPT },
    { id: 'appunti', title: 'Appunti', url: 'https://mega.nz/folder/4bUhDBzA#EkBRNE5HKmguMammZohU6g/folder/9b8wlKQa', aliases: ['app', 'appunti'], category: 'School' },
    { id: 'aml', title: 'AML', url: 'https://elearning.unimib.it/enrol/index.php?id=68868', aliases: ['metodiscie', 'aml'], category: 'School' },
    { id: 'ai_course', title: 'AI', url: 'https://elearning.unimib.it/enrol/index.php?id=68862', aliases: ['AI', 'ai_course'], category: 'School' },
    { id: 'crv', title: 'CRV', url: 'https://elearning.unimib.it/enrol/index.php?id=68849', aliases: ['CRV', 'crv'], category: 'School' },
    { id: 'vipm', title: 'VIPM', url: 'https://elearning.unimib.it/enrol/index.php?id=68845', aliases: ['VIPM', 'vipm'], category: 'School' },
    { id: 'info_course', title: 'Info', url: 'https://elearning.unimib.it/course/view.php?id=62130', aliases: ['info', 'info_course'], category: 'School' },

    // Single Unified AI & LLMs Category (LLMs + LLMs 2)
    { id: 'artificialanalysis', title: 'Analysis', url: 'https://artificialanalysis.ai', aliases: ['analysis'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'aistudio', title: 'AiStudio', url: 'https://aistudio.google.com/prompts/new_chat', aliases: ['aistudio'], category: 'AI & LLMs', searchPath: '/search?q={}' },
    { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com/app', aliases: ['gem', 'gemini'], category: 'AI & LLMs', searchPath: '/search?q={}' },
    { id: 'chatgpt', title: 'Chatgpt', url: 'https://chat.openai.com', aliases: ['gpt', 'chatgpt'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'claude', title: 'Claude', url: 'https://claude.ai', aliases: ['claude'], category: 'AI & LLMs' },
    { id: 'mistral', title: 'Mistral', url: 'https://chat.mistral.ai/chat', aliases: ['mistral'], category: 'AI & LLMs' },
    { id: 'grok', title: 'Grok', url: 'https://grok.com', aliases: ['grok'], category: 'AI & LLMs' },
    { id: 'notebooklm', title: 'Notebooklm', url: 'https://notebooklm.google.com', aliases: ['notebook', 'notebooklm'], category: 'AI & LLMs', searchPath: '/search?q={}' },
    { id: 'openrouter', title: 'OpenRouter', url: 'https://openrouter.ai/chat', aliases: ['openrouter'], category: 'AI & LLMs', searchPath: '/search?q={}' },
    { id: 'lmarena', title: 'Lmarena', url: 'https://lmarena.ai', aliases: ['lmarena'], category: 'AI & LLMs' },
    { id: 'deepseek', title: 'Deepseek', url: 'https://chat.deepseek.com', aliases: ['deepseek'], category: 'AI & LLMs' },
    { id: 'qwen', title: 'Qwen', url: 'https://chat.qwen.ai', aliases: ['qwen'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'perplexity', title: 'Perplexity', url: 'https://www.perplexity.ai', aliases: ['perple', 'perplexity'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'meta_ai', title: 'Meta', url: 'https://www.meta.ai', aliases: ['meta'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'kimi', title: 'Kimi', url: 'https://www.kimi.com', aliases: ['kimi'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'zai', title: 'ZAI', url: 'https://chat.z.ai', aliases: ['zai'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'minimax', title: 'Minimax', url: 'https://agent.minimax.io', aliases: ['minimax'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 't3chat', title: 'T3 Chat', url: 'https://t3.chat', aliases: ['t3chat'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'stepfun', title: 'Stepfun', url: 'https://stepfun.ai/chats/new', aliases: ['stepfun'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'upstage', title: 'Upstage', url: 'https://console.upstage.ai/playground/chat', aliases: ['upstage'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'inceptionlabs', title: 'Inceptionlabs', url: 'https://chat.inceptionlabs.ai', aliases: ['inceptionlabs'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'cohere', title: 'Cohere', url: 'https://dashboard.cohere.com/playground/chat', aliases: ['cohere'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'arcee', title: 'Arcee', url: 'https://chat.arcee.ai/chat', aliases: ['arcee'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'liquid', title: 'Liquid', url: 'https://playground.liquid.ai/chat', aliases: ['liquid'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'k2think', title: 'K2 Think', url: 'https://www.k2think.ai', aliases: ['k2think'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'cloudflare_ai', title: 'Cloudflare PG', url: 'https://playground.ai.cloudflare.com/', aliases: ['playground_cloudflare'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'ernie', title: 'Ernie', url: 'https://ernie.baidu.com', aliases: ['ernie'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'longcat', title: 'Longcat', url: 'https://longcat.chat', aliases: ['longcat'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'byteplus', title: 'BytePlus', url: 'https://www.byteplus.com/en/ai-playground/chat', aliases: ['byteplus'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'sarvam', title: 'Sarvam', url: 'https://dashboard.sarvam.ai/chat', aliases: ['sarvam'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'jamba', title: 'Jamba', url: 'https://studio.ai21.com/v2/workspaces', aliases: ['jamba'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'tinker', title: 'Tinker', url: 'https://tinker.thinkingmachines.ai/playground', aliases: ['tinker'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'motiftech', title: 'Motif Tech', url: 'https://chat.motiftech.io/chat', aliases: ['motiftech'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'llmstats', title: 'LLM Stats', url: 'https://llm-stats.com/leaderboards/llm-leaderboard', aliases: ['llmstats'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'others_ai', title: 'Others', url: '/Users/mattianessi/Developer/whole/web/tilde-enhanced/ai.html', aliases: ['othersAi'], category: 'AI & LLMs' },

    // ImGen (Kept separate)
    { id: 'recraft', title: 'Recraft', url: 'https://www.recraft.ai/projects', aliases: ['recraft'], category: 'ImGen', searchPath: '?q={}' },
    { id: 'ideogram', title: 'Ideogram', url: 'https://ideogram.ai/t/explore', aliases: ['ideogram'], category: 'ImGen', searchPath: '?q={}' },
    { id: 'kling', title: 'Kling', url: 'https://kling.ai/app', aliases: ['kling'], category: 'ImGen', searchPath: '?q={}' },
    { id: 'leonardo', title: 'Leonardo', url: 'https://app.leonardo.ai', aliases: ['leo', 'leonardo'], category: 'ImGen' },
    { id: 'stablediffusion', title: 'Stable Diff', url: 'https://stablediffusionweb.com/app/image-generator', aliases: ['sd', 'stablediffusion'], category: 'ImGen' },
    { id: 'getimg', title: 'getimg', url: 'https://getimg.ai/home', aliases: ['getimg'], category: 'ImGen' },
    { id: 'quiver', title: 'Quiver', url: 'https://app.quiver.ai/', aliases: ['quieverai', 'quiver'], category: 'ImGen' },
    { id: 'krea', title: 'Krea', url: 'https://www.krea.ai/app', aliases: ['krea'], category: 'ImGen' },

    // Media / AudioGen (Kept separate)
    { id: 'suno', title: 'Suno', url: 'https://suno.com', aliases: ['suno'], category: 'Media' },
    { id: 'elevenlabs', title: 'ElevenLabs', url: 'https://elevenlabs.io/app/home', aliases: ['audiogen', 'elevenlabs'], category: 'Media' },

    // Programming
    { id: 'github', title: 'GitHub', url: 'https://github.com', aliases: ['g', 'gh', 'github'], category: 'Programming', searchPath: '/search?q={}' },
    { id: 'leetcode', title: 'LeetCode', url: 'https://leetcode.com/problemset/all/', aliases: ['leetcode'], category: 'Programming' },
    { id: 'paperswithcode', title: 'PapersWithCode', url: 'https://paperswithcode.com', aliases: ['pcode', 'paperswithcode'], category: 'Programming' },
    { id: 'huggingface', title: 'huggingface', url: 'https://huggingface.co', aliases: ['hug', 'huggingface'], category: 'Programming' },
    { id: 'kaggle', title: 'kaggle', url: 'https://www.kaggle.com', aliases: ['kaggle'], category: 'Programming' },
    { id: 'roboflow', title: 'Roboflow', url: 'https://app.roboflow.com/', aliases: ['roboflow'], category: 'Programming' },
    { id: 'producthunt', title: 'Product Hunt', url: 'https://www.producthunt.com', aliases: ['producthunt'], category: 'Programming' },
    { id: 'penpot', title: 'Penpot', url: 'https://design.penpot.app', aliases: ['penpot'], category: 'Programming' },
    { id: 'codewars', title: 'Codewars', url: 'https://www.codewars.com/dashboard', aliases: ['codewars'], category: 'Programming' },
    { id: 'wordreference', title: 'WordReference', url: 'https://www.wordreference.com/', aliases: ['wr', 'wordreference'], category: 'Programming', searchPath: '/enit/{}' }
  ]
};

const cloneConfig = (config: StartpageConfig): StartpageConfig => {
  return JSON.parse(JSON.stringify(config));
};

export class DataStore {
  private config: StartpageConfig = cloneConfig(DEFAULT_CONFIG);
  private categoryOrder: string[] = [];
  private subscribers: (() => void)[] = [];

  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb());
  }

  constructor() {
    this.load();
  }

  public load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_LINKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.commands)) {
          const defaultOrderMap = new Map<string, number>();
          DEFAULT_CONFIG.commands.forEach((d, idx) => {
            defaultOrderMap.set(d.id, idx);
          });

          parsed.commands.forEach((item: LinkItem) => {
            const def = DEFAULT_CONFIG.commands.find(d => d.id === item.id);
            if (def) {
              item.title = def.title;
              item.category = def.category;
              if (def.searchPath) item.searchPath = def.searchPath;
              if (def.searchTemplate) item.searchTemplate = def.searchTemplate;
              if (def.isScript) {
                item.isScript = true;
                item.scriptContent = def.scriptContent;
                item.url = def.url;
              }
              if (def.aliases && def.aliases.length > 0) {
                item.aliases = def.aliases;
              }
            }
            if (item.category === 'LLMs 2' || item.category === 'LLMs') {
              item.category = 'AI & LLMs';
            }
            if (item.id === 'unimib_orari' || item.id === 'orari' || item.title === 'Orari') {
              item.isScript = true;
              item.url = 'javascript:updateOrari()';
              item.scriptContent = ORARI_SCRIPT;
            }
            if (item.id === 'unimib_esami' || item.id === 'esami' || item.title === 'Esami') {
              item.isScript = true;
              item.url = 'javascript:updateEsami()';
              item.scriptContent = ESAMI_SCRIPT;
            }
          });

          parsed.commands.sort((a: LinkItem, b: LinkItem) => {
            const idxA = defaultOrderMap.has(a.id) ? defaultOrderMap.get(a.id)! : 999;
            const idxB = defaultOrderMap.has(b.id) ? defaultOrderMap.get(b.id)! : 999;
            return idxA - idxB;
          });

          this.config = parsed;
        }
      }
      const storedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
      if (storedOrder) {
        this.categoryOrder = JSON.parse(storedOrder);
      }
    } catch {}
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(this.config));
      localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(this.categoryOrder));
    } catch (err) {
      console.warn('Failed to save links to localStorage:', err);
    }
    this.notify();
  }

  public getLinks(): LinkItem[] {
    return [...this.config.commands];
  }

  public getCategoryOrder(): string[] {
    return [...this.categoryOrder];
  }

  public setCategoryOrder(order: string[]): void {
    this.categoryOrder = [...order];
    this.save();
  }

  public renameCategory(oldName: string, newName: string): void {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return;

    this.config.commands.forEach(link => {
      if (link.category === oldName) {
        link.category = trimmedNew;
      }
    });

    const idx = this.categoryOrder.indexOf(oldName);
    if (idx !== -1) {
      this.categoryOrder[idx] = trimmedNew;
    }

    this.save();
  }

  public moveLink(linkId: string, targetCategoryId: string, targetIndex?: number): void {
    const fromIdx = this.config.commands.findIndex(l => l.id === linkId);
    if (fromIdx === -1) return;

    const [draggedLink] = this.config.commands.splice(fromIdx, 1);
    draggedLink.category = targetCategoryId;

    const targetCategoryLinks = this.config.commands.filter(l => l.category === targetCategoryId);

    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < targetCategoryLinks.length) {
      const referenceLink = targetCategoryLinks[targetIndex];
      if (referenceLink) {
        const insertMasterIndex = this.config.commands.indexOf(referenceLink);
        this.config.commands.splice(insertMasterIndex, 0, draggedLink);
      } else {
        this.config.commands.push(draggedLink);
      }
    } else {
      this.config.commands.push(draggedLink);
    }
    this.save();
  }

  public getCategories(): CategoryGroup[] {
    const groupsMap: Record<string, LinkItem[]> = {};

    this.config.commands.forEach(link => {
      const cat = link.category || 'General';
      if (!groupsMap[cat]) {
        groupsMap[cat] = [];
      }
      groupsMap[cat]?.push(link);
    });

    const categoryNames = Object.keys(groupsMap);

    if (this.categoryOrder.length > 0) {
      categoryNames.sort((a, b) => {
        const idxA = this.categoryOrder.indexOf(a);
        const idxB = this.categoryOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }

    return categoryNames.map(categoryName => ({
      name: categoryName,
      links: groupsMap[categoryName] ?? []
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
    return JSON.stringify({
      config: this.config,
      categoryOrder: this.categoryOrder
    }, null, 2);
  }

  public importJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.commands)) {
        this.config = parsed;
        this.save();
        return true;
      } else if (parsed && parsed.config && Array.isArray(parsed.config.commands)) {
        this.config = parsed.config;
        if (Array.isArray(parsed.categoryOrder)) {
          this.categoryOrder = parsed.categoryOrder;
        }
        this.save();
        return true;
      }
    } catch {}
    return false;
  }

  public resetToDefault(): void {
    this.config = cloneConfig(DEFAULT_CONFIG);
    this.categoryOrder = [];
    try {
      localStorage.removeItem(STORAGE_LINKS_KEY);
      localStorage.removeItem(STORAGE_ORDER_KEY);
    } catch {}
    this.notify();
  }
}

export const dataStore = new DataStore();
