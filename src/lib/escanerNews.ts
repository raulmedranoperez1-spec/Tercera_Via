export interface EscanerFrame {
  titular: string;
  periodico: string;
}

export interface EscanerTerceraVia {
  tipo: 'archivo' | 'documento' | 'enlace';
  nombre: string;
  url: string;
}

export interface EscanerFuentePrimaria {
  nombre: string;
  enlace: string;
}

export interface EscanerNews {
  id: string;
  titulo: string;
  creadoEn: string;
  marco1: EscanerFrame;
  marco2: EscanerFrame;
  terceraVia: EscanerTerceraVia;
  fuentePrimaria: EscanerFuentePrimaria;
}

const STORAGE_KEY = 'tercera_via_escaner_noticias';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

export function loadEscanerNews(): EscanerNews[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EscanerNews[]) : [];
  } catch {
    return [];
  }
}

export function saveEscanerNews(news: EscanerNews): void {
  try {
    const all = loadEscanerNews().filter((item) => item.id !== news.id);
    all.unshift(news);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent degradation: storage lleno o no disponible
  }
}

export function findEscanerByTitulo(titulo: string): EscanerNews | undefined {
  const target = normalize(titulo);
  if (!target) return undefined;
  return loadEscanerNews().find((item) => normalize(item.titulo) === target);
}
