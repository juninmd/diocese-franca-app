import type React from 'react';
import type { Ionicons } from '@expo/vector-icons';

// Tipos de domínio espelhando o JSON da API (backend/routes + backend/data/*.json).

/** Nome válido de ícone do Ionicons. */
export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Envelope padrão das respostas: `{ success, count, data }`. */
export interface ApiEnvelope<T> {
  success: boolean;
  count?: number;
  data: T;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Chapel {
  name: string;
  address?: string | null;
}

export interface Church {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  /** ISO "AAAA-MM-DD". */
  foundedAt: string | null;
  officeHours: string[];
  priestAttendance: string[];
  description: string | null;
  image: string | null;
  website: string | null;
  socialMedia: SocialMedia | null;
  chapels: Chapel[];
  massNotes: string[];
  forania: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinatesVerified?: boolean;
  coordinatesPrecision?: string;
}

/** Missa da grade semanal (`dayOfWeek` em português, ex.: "Domingo"; `time` "HH:MM"). */
export interface Mass {
  id: number;
  churchId: number;
  dayOfWeek: string;
  time: string;
  type: string;
}

/** Item de `/api/masses` e `/api/masses/by-day`: missa com a igreja resumida. */
export interface MassWithChurch extends Mass {
  church: Pick<Church, 'id' | 'name' | 'address'> | null;
}

/** Próxima missa: a missa original + minutos até começar (`startsAt` só vem do backend). */
export interface NextMass extends Mass {
  startsInMinutes: number;
  startsAt?: string;
}

export interface Priest {
  id: number;
  name: string;
  title: string;
  churchId: number;
  churchIds?: number[];
  email: string | null;
  phone: string | null;
  bio: string | null;
  image: string | null;
  /** "DD/MM/AAAA". */
  birthDate: string | null;
  ordinationDate: string | null;
}

/** Item de `/api/priests`: padre com a paróquia resumida. */
export interface PriestListItem extends Priest {
  church: Pick<Church, 'id' | 'name' | 'city' | 'state'> | null;
}

/** `/api/priests/:id`: padre com a paróquia completa (ausente se não encontrada). */
export interface PriestDetail extends Priest {
  church?: Church | null;
}

/** `/api/churches/:id`: igreja com missas, pároco e equipe. */
export interface ChurchDetail extends Church {
  masses: Mass[];
  priest?: Priest;
  clergy: Priest[];
  nextMass: NextMass | null;
}

export interface NearbyChurch extends Church {
  distanceKm: number;
  nextMass: NextMass | null;
}

/** `/api/churches/nearby` (resposta inteira, sem desembrulhar). */
export interface NearbyResult {
  success: boolean;
  origin: { latitude: number; longitude: number };
  count: number;
  data: NearbyChurch[];
  nearest: NearbyChurch | null;
}

/** Igreja como aparece na lista: do catálogo ou do "perto de mim" (com distância). */
export type ChurchListItem = Church & { distanceKm?: number; nextMass?: NextMass | null };

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  image: string | null;
  /** Data por extenso, ex.: "4 de novembro". */
  date: string;
  publishedAt: string;
}

export interface Coords {
  latitude: number;
  longitude: number;
}
