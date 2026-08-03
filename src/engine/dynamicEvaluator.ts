/**
 * Dynamic URL Evaluator
 * Computes dynamic parameters and rules for URLs (e.g., date formats, Unimib course schedules).
 */

export const parseDateFormatted = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const parseDateISO = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * The Unimib timetable portal's `anno` parameter is the year the CURRENT
 * academic year started (e.g. 2025 for 2025/26). Academic years begin in
 * September: months September..December (getMonth() >= 8) map to the current
 * calendar year, January..August to the previous one.
 * (E.g. 3 Aug 2026 → anno=2025 → academic year 2025/26.)
 */
export const getAcademicYearStart = (date: Date): number =>
  date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;

export const getUnimibOrariUrl = (currentDate: Date = new Date()): string => {
  const today = parseDateFormatted(currentDate);
  const anno = getAcademicYearStart(currentDate);
  return `https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easycourse&form-type=corso&include=corso&txtcurr=1+-+PERCORSO+COMUNE&anno=${anno}&scuola=&corso=F1802Q&anno2%5B%5D=GGG%7C1&visualizzazione_orario=cal&date=${today}&periodo_didattico=&_lang=it&list=&week_grid_type=-1&ar_codes_=EC508261%7CEC512923%7CEC508282%7CEC512924%7CEC509735&ar_select_=true%7Ctrue%7Ctrue%7Ctrue%7Cfalse&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#`;
};

export const getUnimibEsamiUrl = (currentDate: Date = new Date()): string => {
  const todayDate = parseDateFormatted(currentDate);
  const futureDate = new Date(currentDate);
  futureDate.setDate(futureDate.getDate() + 60);
  const dateto = parseDateFormatted(futureDate);
  return `https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easytest&form-type=et_cdl&include=et_cdl&et_er=1&scuola=AreaScientifica-Informatica&esami_cdl=F1802Q&anno2%5B%5D=1&datefrom=${todayDate}&dateto=${dateto}&_lang=it&list=&week_grid_type=-1&ar_codes_=&ar_select_=&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#`;
};

/**
 * Pure evaluation (no external state): depends only on (rawUrl, dynamicRule,
 * date). Extracted so resolveDynamicUrl can wrap it with a memo cache.
 */
const computeDynamicUrl = (rawUrl: string, dynamicRule: string | undefined, date: Date): string => {
  if (dynamicRule === 'unimib_orari') {
    return getUnimibOrariUrl(date);
  }
  if (dynamicRule === 'unimib_esami') {
    return getUnimibEsamiUrl(date);
  }

  // Template string interpolation for date parameters
  let resolved = rawUrl;
  if (resolved.includes('{{DD-MM-YYYY}}')) {
    resolved = resolved.replace(/\{\{DD-MM-YYYY\}\}/g, parseDateFormatted(date));
  }
  if (resolved.includes('{{YYYY-MM-DD}}')) {
    resolved = resolved.replace(/\{\{YYYY-MM-DD\}\}/g, parseDateISO(date));
  }

  return resolved;
};

/**
 * resolveDynamicUrl is called once per link per render (grid columns, search
 * rows, edit modal). It is pure wrt (url, rule, day): all dynamic rules only
 * depend on "today" — so results are memoized for the current day. The cache
 * key is `day | rule | url` (the function receives no link id; url+rule is
 * the caller-visible identity). The day segment guarantees stale entries are
 * never served after midnight. Hard cap: wholesale reset beyond the bound
 * (entries accumulate one per link per day on long-lived pages).
 */
const DYNAMIC_URL_CACHE_LIMIT = 500;
const dynamicUrlCache = new Map<string, string>();

/**
 * Test-only observability (intentionally NOT re-exported from engine/index):
 * counts real computations (cache misses).
 */
export const dynamicUrlCacheStats = { computeCount: 0 };

export const clearDynamicUrlCache = (): void => {
  dynamicUrlCache.clear();
  dynamicUrlCacheStats.computeCount = 0;
};

export const resolveDynamicUrl = (
  rawUrl: string,
  dynamicRule?: string,
  date: Date = new Date(),
): string => {
  const cacheKey = `${date.toDateString()}|${dynamicRule ?? ''}|${rawUrl}`;
  const cached = dynamicUrlCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  dynamicUrlCacheStats.computeCount++;
  const resolved = computeDynamicUrl(rawUrl, dynamicRule, date);

  if (dynamicUrlCache.size >= DYNAMIC_URL_CACHE_LIMIT) {
    dynamicUrlCache.clear();
  }
  dynamicUrlCache.set(cacheKey, resolved);
  return resolved;
};
