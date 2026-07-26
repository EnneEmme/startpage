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

export const getUnimibOrariUrl = (currentDate: Date = new Date()): string => {
  const today = parseDateFormatted(currentDate);
  return `https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easycourse&form-type=corso&include=corso&txtcurr=1+-+PERCORSO+COMUNE&anno=2025&scuola=&corso=F1802Q&anno2%5B%5D=GGG%7C1&visualizzazione_orario=cal&date=${today}&periodo_didattico=&_lang=it&list=&week_grid_type=-1&ar_codes_=EC508261%7CEC512923%7CEC508282%7CEC512924%7CEC509735&ar_select_=true%7Ctrue%7Ctrue%7Ctrue%7Cfalse&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#`;
};

export const getUnimibEsamiUrl = (currentDate: Date = new Date()): string => {
  const todayDate = parseDateFormatted(currentDate);
  const futureDate = new Date(currentDate);
  futureDate.setDate(futureDate.getDate() + 60);
  const dateto = parseDateFormatted(futureDate);
  return `https://gestioneorari.didattica.unimib.it/PortaleStudentiUnimib/index.php?view=easytest&form-type=et_cdl&include=et_cdl&et_er=1&scuola=AreaScientifica-Informatica&esami_cdl=F1802Q&anno2%5B%5D=1&datefrom=${todayDate}&dateto=${dateto}&_lang=it&list=&week_grid_type=-1&ar_codes_=&ar_select_=&col_cells=0&empty_box=0&only_grid=0&highlighted_date=0&all_events=0#`;
};

export const resolveDynamicUrl = (rawUrl: string, dynamicRule?: string, date: Date = new Date()): string => {
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
