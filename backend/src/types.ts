// Tipos de domínio da API: formato de data/*.json, do que o scraper extrai e das respostas.

export const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'] as const;
export type DayOfWeek = (typeof DAYS)[number];

/** Saída mínima de log usada pelo scraper (console ou um dublê nos testes). */
export type Logger = Pick<Console, 'log' | 'warn'>;

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Chapel {
  name: string;
  address: string | null;
  /** horários próprios da capela (quando o site informa) */
  masses?: WeeklyMass[];
  /** horários irregulares ("1º domingo do mês") */
  massNotes?: string[];
}

/** Função de um clérigo numa paróquia, como aparece na página ("Pároco", "Diácono"...). */
export interface ClergyRole {
  name: string;
  title: string;
}

/** Horário semanal regular extraído da seção "Missas". */
export interface WeeklyMass {
  dayOfWeek: DayOfWeek;
  time: string;
}

/** Paróquia como sai de `parseParish` (antes de virar Church). */
export interface ParsedParish {
  sourceId: number;
  name: string;
  city: string;
  state: string;
  address: string;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  foundedAt: string | null;
  officeHours: string[];
  priestAttendance: string[];
  description: string | null;
  image: string | null;
  website: string | null;
  clergy: ClergyRole[];
  socialMedia: SocialMedia | null;
  chapels: Chapel[];
  masses: WeeklyMass[];
  massNotes: string[];
}

/** Registro de data/churches.json (id = id da página da paróquia no site). */
export interface Church extends Omit<ParsedParish, 'sourceId' | 'clergy' | 'masses'> {
  id: number;
  forania: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinatesVerified: boolean;
  /** 'address' (geocode do endereço da matriz) ou 'city' (centro da cidade) */
  coordinatesPrecision: string;
}

/** Registro de data/priests.json. `churchIds` lista todas as paróquias atendidas. */
export interface Priest {
  id: number;
  name: string;
  title: string;
  churchId: number;
  churchIds?: number[];
  email: string | null;
  phone: string | null;
  bio: string;
  image: string | null;
  birthDate: string | null;
  ordinationDate: string | null;
}

/** Registro de data/masses.json. O dia vem do disco, por isso é `string` (validado na leitura). */
export interface Mass {
  id: number;
  churchId: number;
  dayOfWeek: string;
  time: string;
  type: string;
}

/** Dia e horário bastam para calcular a próxima missa. */
export interface MassSlot {
  dayOfWeek?: string;
  time?: string;
}

export interface NextMassTiming {
  startsAt: string;
  startsInMinutes: number;
}

export type NextMass = Mass & NextMassTiming;

/** Registro de data/news.json. */
export interface NewsItem {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  image: string | null;
  date: string;
  publishedAt: string | null;
}

/** Ajustes manuais por id (data/depara.json). Campos livres: sobrescrevem o registro base. */
export type DeparaOverrides = Record<string, Record<string, unknown>>;

export interface Depara {
  churches?: DeparaOverrides;
  priests?: DeparaOverrides;
}

/** "Cidade|UF" -> [latitude, longitude] (data/cityCoords.json). */
export type CityCoords = Record<string, [number, number]>;

/** Catálogo servido pela API, com índices por id. */
export interface Catalog {
  sources: readonly unknown[];
  churches: Church[];
  priests: Priest[];
  masses: Mass[];
  churchesById: Map<number, Church>;
  massesByChurch: Map<number, Mass[]>;
}

/** Catálogo bruto gerado pelo scraper (sem de-para). */
export interface ScrapedCatalog {
  churches: Church[];
  masses: Mass[];
  priests: Priest[];
}

export interface Bishop {
  name: string;
  phone: string | null;
  bio: string;
  image?: string | null;
}

/** Entrada do diretório de clero (páginas de padres e diáconos do site). */
export interface ClergyDirectoryEntry {
  name: string;
  link?: string;
  img?: string;
  type?: 'Padre' | 'Diácono';
  birthDate?: string | null;
  ordinationDate?: string | null;
  image?: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// Campos que os middlewares acrescentam à requisição.
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      coords?: Coordinates;
      canonicalDay?: string;
    }
  }
}
