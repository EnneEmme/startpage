/**
 * DataStore Engine
 * Handles links configuration, category grouping, custom category ordering, category renaming, precise link reordering/insertion, dynamic link rules, and localStorage persistence.
 */

import type { LinkItem, CategoryGroup, StartpageConfig } from '../types/startpage';
import { rankStorage } from './rankStorage';

const STORAGE_LINKS_KEY = 'startpage_custom_links';
const STORAGE_ORDER_KEY = 'startpage_category_order';
const STORAGE_MIGRATIONS_KEY = 'startpage_migrations';
const MIGRATION_V2 = 'v2_legacy_normalization';
const MIGRATION_V3 = 'migrated_v3_unimib_dynamic';

/**
 * Stable, readable base URLs for the built-in Unimib links: they feed
 * favicons/tooltips/edit-forms only — navigation always goes through the
 * `dynamicUrlRule` (dynamicEvaluator is the single source of truth for the
 * full dated URL). This is what remains of the old `javascript:` stubs after
 * the dynamic-only migration: no script machinery ships in the defaults.
 */
export const UNIMIB_ORARI_BASE_URL = 'https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easycourse&corso=F1802Q';
export const UNIMIB_ESAMI_BASE_URL = 'https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easytest&esami_cdl=F1802Q';

export const DEFAULT_CONFIG: StartpageConfig = {
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
    { id: 'unimib_esami', title: 'Esami', url: UNIMIB_ESAMI_BASE_URL, aliases: ['esami', 'unimib_esami'], category: 'School', dynamicUrlRule: 'unimib_esami' },
    { id: 'unimib_orari', title: 'Orari', url: UNIMIB_ORARI_BASE_URL, aliases: ['orari', 'unimib_orari'], category: 'School', dynamicUrlRule: 'unimib_orari' },
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
    { id: 'proton_lumo', title: 'Proton Lumo', url: 'https://lumo.proton.me/', aliases: ['lumo', 'protonlumo'], category: 'AI & LLMs', searchPath: '?q={}' },
    { id: 'huggingface_chat', title: 'Chat HG', url: 'https://huggingface.co/chat/', aliases: ['chathg', 'chathf', 'hfchat'], category: 'AI & LLMs', searchPath: '?q={}' },
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
    { id: 'fishaudio', title: 'Fish Audio', url: 'https://fish.audio/app/', aliases: ['fish', 'fishaudio'], category: 'Media' },

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

const cloneConfig = (config: StartpageConfig): StartpageConfig => structuredClone(config);

/**
 * Validates and normalizes a single link item coming from storage or an
 * imported backup. Returns null for unrecoverable entries (missing identity
 * fields); otherwise fills safe defaults (aliases, category) so downstream
 * code (fuzzy search, grid) never crashes on malformed data.
 */
export const sanitizeLinkItem = (raw: unknown): LinkItem | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const item = raw as Partial<LinkItem>;

  if (typeof item.id !== 'string' || !item.id.trim()) return null;
  if (typeof item.title !== 'string' || !item.title.trim()) return null;
  if (typeof item.url !== 'string' || !item.url.trim()) return null;

  return {
    id: item.id,
    title: item.title,
    url: item.url,
    aliases: Array.isArray(item.aliases)
      ? item.aliases.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
      : [],
    category: typeof item.category === 'string' && item.category.trim() ? item.category : 'General',
    ...(typeof item.icon === 'string' ? { icon: item.icon } : {}),
    ...(typeof item.color === 'string' ? { color: item.color } : {}),
    ...(typeof item.searchPath === 'string' ? { searchPath: item.searchPath } : {}),
    ...(typeof item.searchTemplate === 'string' ? { searchTemplate: item.searchTemplate } : {}),
    ...(typeof item.dynamicUrlRule === 'string' ? { dynamicUrlRule: item.dynamicUrlRule } : {}),
    ...(typeof item.isScript === 'boolean' ? { isScript: item.isScript } : {}),
    ...(typeof item.scriptContent === 'string' ? { scriptContent: item.scriptContent } : {})
  };
};

const sanitizeCommands = (raw: unknown, source: string): LinkItem[] => {
  if (!Array.isArray(raw)) return [];
  const clean: LinkItem[] = [];
  let dropped = 0;
  for (const entry of raw) {
    const item = sanitizeLinkItem(entry);
    if (item) {
      clean.push(item);
    } else {
      dropped++;
    }
  }
  if (dropped > 0) {
    console.warn(`[DataStore] Discarded ${dropped} malformed link(s) from ${source}`);
  }
  return clean;
};

/**
 * Import hardening (SECURITY): imported JSON is UNTRUSTED data — backups can
 * come from anywhere. Script machinery is stripped from every imported item:
 * `isScript`/`scriptContent` are removed, and an item whose url is a
 * `javascript:` bookmarklet is discarded entirely (a scriptless javascript:
 * url has no legitimate purpose and would re-arm stored XSS). An item
 * survives only if its remaining url is web-navigable (http(s):// or
 * root-relative "/").
 *
 * load() from localStorage stays permissive BY DESIGN: that is the profile's
 * OWN trusted data, written by this same app.
 */
const isWebNavigableUrl = (url: string): boolean => /^https?:\/\//i.test(url.trim()) || url.trim().startsWith('/');

const neutralizeImportedScript = (item: LinkItem): LinkItem | null => {
  const hasScriptFlag = item.isScript === true;
  const hasScriptContent = typeof item.scriptContent === 'string' && item.scriptContent.trim().length > 0;
  const hasJavascriptUrl = item.url.trim().toLowerCase().startsWith('javascript:');
  if (!hasScriptFlag && !hasScriptContent && !hasJavascriptUrl) return item;

  if (!isWebNavigableUrl(item.url)) {
    console.warn(`[DataStore] Import: discarded scripted link "${item.title}" (no navigable url left after stripping javascript:)`);
    return null;
  }

  const cleaned: LinkItem = { ...item };
  delete cleaned.isScript;
  delete cleaned.scriptContent;
  console.warn(`[DataStore] Import: neutralized scripted link "${item.title}" (script machinery stripped, url kept)`);
  return cleaned;
};

/**
 * importJson pipeline step (runs AFTER normalizeLegacyItem): strips script
 * machinery from the untrusted payload, counting and logging discards.
 */
const neutralizeImportedCommands = (items: LinkItem[]): LinkItem[] => {
  const clean: LinkItem[] = [];
  let discarded = 0;
  for (const item of items) {
    const neutralized = neutralizeImportedScript(item);
    if (neutralized) {
      clean.push(neutralized);
    } else {
      discarded++;
    }
  }
  if (discarded > 0) {
    console.warn(`[DataStore] Discarded ${discarded} scripted link(s) from import`);
  }
  return clean;
};

/**
 * Built-in Unimib links are dynamic-url links, NOT scripts (single source of
 * truth: dynamicEvaluator). Strips any leftover script machinery (legacy
 * default scripts or tampered payloads), ensures the correct dynamicUrlRule,
 * and replaces a `javascript:` stub url with the readable portal base url.
 * User customizations (title/icon/category/aliases) are preserved.
 * Matches by dynamicUrlRule, legacy id, or exact default title.
 * Returns true when the item was modified.
 */
const normalizeUnimibDynamicItem = (item: LinkItem): boolean => {
  const isOrari = item.dynamicUrlRule === 'unimib_orari' || item.id === 'unimib_orari' || item.id === 'orari' || item.title === 'Orari';
  const isEsami = item.dynamicUrlRule === 'unimib_esami' || item.id === 'unimib_esami' || item.id === 'esami' || item.title === 'Esami';
  if (!isOrari && !isEsami) return false;

  const rule = isOrari ? 'unimib_orari' : 'unimib_esami';
  const baseUrl = isOrari ? UNIMIB_ORARI_BASE_URL : UNIMIB_ESAMI_BASE_URL;
  let dirty = false;

  if (item.dynamicUrlRule !== rule) {
    item.dynamicUrlRule = rule;
    dirty = true;
  }
  if (item.isScript !== undefined) {
    delete item.isScript;
    dirty = true;
  }
  if (item.scriptContent !== undefined) {
    delete item.scriptContent;
    dirty = true;
  }
  if (item.url.trim().toLowerCase().startsWith('javascript:')) {
    item.url = baseUrl;
    dirty = true;
  }
  return dirty;
};

/**
 * One-shot legacy normalization (migration v2):
 * - merges the old 'LLMs 2'/'LLMs' categories into 'AI & LLMs'
 * - normalizes the built-in Unimib links (legacy items identified by id or
 *   exact default title) into their dynamic-url scriptless form.
 * Idempotent: safe to run on imports of old backups as well.
 * Returns true when the item was modified.
 */
const normalizeLegacyItem = (item: LinkItem): boolean => {
  let dirty = false;
  if (item.category === 'LLMs 2' || item.category === 'LLMs') {
    item.category = 'AI & LLMs';
    dirty = true;
  }
  if (normalizeUnimibDynamicItem(item)) dirty = true;
  return dirty;
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

  /**
   * Loads the persisted configuration.
   * User data is the source of truth: stored links are NEVER re-sorted to
   * match DEFAULT_CONFIG order (drag&drop reordering must survive reloads)
   * and default fields are NEVER force-applied over user edits (renames must
   * survive reloads). DEFAULT_CONFIG only seeds a fresh install.
   */
  public load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_LINKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.commands)) {
          this.config = { commands: sanitizeCommands(parsed.commands, 'localStorage') };
        }
      }
      const storedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        if (Array.isArray(parsedOrder)) {
          this.categoryOrder = parsedOrder;
        }
      }
    } catch (err) {
      console.warn('[DataStore] Failed to load stored configuration, falling back to defaults:', err);
    }
    this.runMigrations();
  }

  /**
   * Applies one-shot data migrations, tracked via a flag in localStorage so
   * each migration runs exactly once per profile (idempotent per version key).
   */
  private runMigrations(): void {
    let done: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(STORAGE_MIGRATIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') done = parsed;
      }
    } catch (err) {
      console.warn('[DataStore] Failed to read migration flags:', err);
    }

    // Ordered one-shot migrations; each normalizer is item-level idempotent.
    const migrations: Record<string, (item: LinkItem) => boolean> = {
      [MIGRATION_V2]: normalizeLegacyItem,
      // v3 (security): Unimib links become dynamic-url-only — strips script
      // machinery and javascript: stub urls from stored profiles.
      [MIGRATION_V3]: normalizeUnimibDynamicItem
    };

    const persistFlags = () => {
      try {
        localStorage.setItem(STORAGE_MIGRATIONS_KEY, JSON.stringify(done));
      } catch (err) {
        console.warn('[DataStore] Failed to persist migration flags:', err);
      }
    };

    for (const [flag, normalize] of Object.entries(migrations)) {
      if (done[flag]) continue;
      let dirty = false;
      this.config.commands.forEach(item => {
        if (normalize(item)) dirty = true;
      });
      done[flag] = true;
      persistFlags();
      if (dirty) this.save();
    }
  }

  /**
   * Deliberately SYNCHRONOUS (no debounce — evaluated and rejected during the
   * perf/audit-p4 pass): dataStore mutations are discrete, low-frequency user
   * actions (add/edit/remove/move), not a hot path like click ranking
   * (rankStorage.scheduleSave). Synchronous save+notify keeps subscribers
   * (signals, tests, cross-tab consistency) strictly ordered after each
   * mutation and avoids speculative regressions on flows that read storage
   * right after writing. Do not "optimize" this without trunk-level
   * integration-test evidence.
   */
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
    // Deep-clone on the way out: callers receive snapshots they may freely
    // mutate (forms, undo captures) without corrupting the store.
    return structuredClone(this.config.commands);
  }

  public getCategoryOrder(): string[] {
    return [...this.categoryOrder];
  }

  public setCategoryOrder(order: string[]): void {
    this.categoryOrder = [...order];
    this.save();
  }

  /**
   * Registers a brand-new category at the end of the user-defined order so
   * getCategories() does not relegate it to the "unknown" tail. Idempotent.
   * When no explicit order exists yet (fresh/default profile), the implicit
   * config-defined order is seeded first so the new category lands LAST.
   */
  public addCategory(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (this.categoryOrder.length === 0) {
      this.categoryOrder = this.getCategories().map(c => c.name);
    }
    if (this.categoryOrder.includes(trimmed)) return;
    this.categoryOrder.push(trimmed);
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
    if (!draggedLink) return; // defensive: fromIdx validity already checked above
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

    // Deep-clone: group link arrays currently share live LinkItem references
    // with the store; return an owned snapshot instead (see getLinks).
    return structuredClone(
      categoryNames.map(categoryName => ({
        name: categoryName,
        links: groupsMap[categoryName] ?? []
      }))
    );
  }

  public addLink(link: LinkItem): void {
    this.config.commands = this.config.commands.filter(l => l.id !== link.id);
    this.config.commands.push(link);
    this.save();
  }

  /**
   * In-place update for edits: replaces the item by id preserving its
   * position in the master list (addLink would push it to the end and thus
   * to the bottom of its category column).
   */
  public updateLink(link: LinkItem): void {
    const idx = this.config.commands.findIndex(l => l.id === link.id);
    if (idx === -1) {
      this.config.commands.push(link);
    } else {
      this.config.commands[idx] = link;
    }
    this.save();
  }

  public removeLink(linkId: string): void {
    this.config.commands = this.config.commands.filter(l => l.id !== linkId);
    this.save();
  }

  public exportJson(): string {
    return JSON.stringify({
      config: this.config,
      categoryOrder: this.categoryOrder,
      ranks: rankStorage.getRankData()
    }, null, 2);
  }

  public importJson(jsonString: string): boolean {
    const applyRanks = (candidate: unknown) => {
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        rankStorage.importRankData(candidate as Parameters<typeof rankStorage.importRankData>[0]);
      }
    };

    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.commands)) {
        this.config = { commands: sanitizeCommands(parsed.commands, 'import') };
        // Old backups may contain legacy categories/scripts: normalize on import
        this.config.commands.forEach(normalizeLegacyItem);
        // Untrusted payload: strip script machinery (store-XSS hardening)
        this.config.commands = neutralizeImportedCommands(this.config.commands);
        applyRanks(parsed.ranks);
        this.save();
        return true;
      } else if (parsed && parsed.config && Array.isArray(parsed.config.commands)) {
        this.config = { commands: sanitizeCommands(parsed.config.commands, 'import') };
        this.config.commands.forEach(normalizeLegacyItem);
        this.config.commands = neutralizeImportedCommands(this.config.commands);
        if (Array.isArray(parsed.categoryOrder)) {
          this.categoryOrder = parsed.categoryOrder.filter((c: unknown): c is string => typeof c === 'string');
        }
        applyRanks(parsed.ranks);
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
