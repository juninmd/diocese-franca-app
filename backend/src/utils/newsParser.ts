import * as cheerio from 'cheerio';
import { toHttpsUrl } from './safeUrl';
import type { NewsItem } from '../types';

export const ORIGIN = 'https://diocesefranca.org.br';
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
// O site grava a data/hora de publicação no nome do arquivo: 20261019202902_foto.png (horário de Brasília).
const IMAGE_STAMP = /(?:^|\/)(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_/;
const MAX_DESCRIPTION = 160;

const clean = (text: string | null | undefined): string => (text || '').replace(/\s+/g, ' ').trim();

const sourceIdOf = (link: string | null): number | null => {
  if (!link) return null;
  try {
    const id = new URL(link).searchParams.get('id');
    return id && /^\d+$/.test(id) ? Number(id) : null;
  } catch {
    return null;
  }
};

// "2026-10-19T20:29:02-03:00" a partir do nome da imagem (null se a data for impossível).
export function publishedAtFromImage(image: string | null | undefined): string | null {
  const m = (image || '').match(IMAGE_STAMP);
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1).map(Number);
  const valid = month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour < 24 && minute < 60 && second < 60;
  if (!valid || year < 2000) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}-03:00`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

// "19 de outubro" (ou "19 de outubro de 2025" quando não é o ano corrente).
export function formatDate(publishedAt: string | null, now: Date = new Date()): string {
  if (!publishedAt) return '';
  const [year, month, day] = publishedAt.slice(0, 10).split('-').map(Number);
  const base = `${day} de ${MONTHS[month - 1]}`;
  return year === now.getFullYear() ? base : `${base} de ${year}`;
}

export function shortenText(text: string, max: number = MAX_DESCRIPTION): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, '');
  return `${cut.replace(/[\s,;:.\-–]+$/, '')}…`;
}

/**
 * Notícias da home de diocesefranca.org.br. Itens sem título ou sem link para a
 * matéria são descartados; links repetidos são unificados.
 */
export function parseNews(html: string, now: Date = new Date()): NewsItem[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  let items = $('.section_post_left');
  if (!items.length) items = $('.noticia_item');

  const seen = new Set<number>();
  const news: NewsItem[] = [];
  items.each((index, el) => {
    const $el = $(el);
    const anchor = $el.find('h2.post_title a, .post_title a').first();
    const rawHref = anchor.attr('href') || $el.find('a[href*="noticia_detalhe"]').first().attr('href');
    const link = toHttpsUrl(rawHref, { site: ORIGIN });
    const sourceId = sourceIdOf(link);
    const title = clean(anchor.text() || $el.find('h1, h2, .title').first().text());
    if (!link || !sourceId || !title || seen.has(sourceId)) return;
    seen.add(sourceId);

    const imageSrc = clean($el.find('img.scale_image').first().attr('src') || $el.find('img.scale_image').first().attr('data-src'));
    const image = imageSrc ? toHttpsUrl(encodeURI(decodeURI(imageSrc)), { site: ORIGIN }) : null;
    const publishedAt = publishedAtFromImage(imageSrc);
    const paragraph = $el.find('.post_text p').toArray().map((p) => clean($(p).text())).find(Boolean) || '';

    news.push({
      id: sourceId,
      title,
      category: clean($el.find('.banner_button').first().text()) || 'Geral',
      description: shortenText(paragraph),
      link,
      image,
      date: formatDate(publishedAt, now),
      publishedAt,
    });
  });
  return news;
}
