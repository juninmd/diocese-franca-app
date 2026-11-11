import type { ParsedParish } from '../src/types';

// Paróquia parcial para testes do buildCatalog: só os campos que ele lê são obrigatórios.
export type ParishFixture = Pick<ParsedParish, 'sourceId' | 'name' | 'city' | 'state' | 'clergy' | 'masses'> & Partial<ParsedParish>;

export const parishFixture = (parish: ParishFixture): ParsedParish => parish as ParsedParish;
