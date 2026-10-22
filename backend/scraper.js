const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { decode } = require('html-entities');
const { parseParish, SITE } = require('./utils/parishParser');
const { htmlToText } = require('./utils/htmlText');

const DATA_DIR = path.join(__dirname, 'data');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
    'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
];

// Helper to decode HTML entities in text
const decodeHtmlEntities = (text) => {
    if (!text) return '';
    return decode(text);
};

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

/**
 * Scrapes news articles from the homepage of https://diocesefranca.org.br/
 */
const scrapeNews = async () => {
  let data = null;
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
      try {
          const response = await axios.get('https://diocesefranca.org.br/', {
              headers: {
                  'User-Agent': getRandomUserAgent(),
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                  'Referer': 'https://www.google.com/'
              },
              timeout: 25000
          });
          data = response.data;
          break; // success
      } catch (err) {
          attempt++;
          const status = err.response ? err.response.status : 'No response status';
          console.error(`Attempt ${attempt} failed to fetch diocesefranca.org.br: ${err.message} (Status: ${status})`);
          if (attempt >= maxRetries) {
              break;
          }
          await wait(2000 * Math.pow(2, attempt));
      }
  }

  if (!data) {
      console.warn('Scrape news failed to retrieve HTML, preserving existing news.json fallback if available.');
      const outputPath = path.join(DATA_DIR, 'news.json');
      if (!fs.existsSync(outputPath)) {
          fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
      }
      return [];
  }

  try {
    const $ = cheerio.load(data);
    const news = [];

    let newsElements = $('.section_post_left');

    if (newsElements.length === 0) {
        console.log('Fallback: .section_post_left is empty, using .noticia_item instead');
        newsElements = $('.noticia_item');
    }

    newsElements.each((i, el) => {
        try {
            let titleElement = $(el).find('h2.post_title a');
            let link = titleElement.length > 0 ? (titleElement.attr('href') ? titleElement.attr('href').trim() : '#') : '#';
            let title = titleElement.length > 0 ? titleElement.text().trim() : '';

            if (!title || title === '') {
                console.log('Fallback: h2.post_title a tag missing or empty, using h2 text instead');
                titleElement = $(el).find('h1.title, h2.post_title, .title');
                title = titleElement.length > 0 ? titleElement.text().trim() : 'Sem título disponível';
            }

            title = decodeHtmlEntities(title);
            title = title.replace(/["']/g, '').trim();

            const categoryElement = $(el).find('.buttons_container a.banner_button').first();
            const category = categoryElement.length > 0 ? categoryElement.text().trim() : 'Geral';

            const imgTag = $(el).find('.scale_image_container img.scale_image');
            let image = imgTag.length > 0 ? (imgTag.attr('src') ? imgTag.attr('src').trim() : imgTag.attr('data-src') ? imgTag.attr('data-src').trim() : '') : '';

            const descriptionElement = $(el).find('.post_text p').first();
            let descriptionText = descriptionElement.length > 0 && descriptionElement.text().trim() !== '' ? descriptionElement.text().trim() : $(el).text().trim();

            descriptionText = decodeHtmlEntities(descriptionText);
            descriptionText = descriptionText.replace(/\s+/g, ' ').trim();
            descriptionText = descriptionText.length > 150 ? descriptionText.substring(0, 150).replace(/\s+\S*$/, '') + '...' : descriptionText;
            descriptionText = descriptionText.replace(/[,;\-]+$/g, '').trim();

            const description = descriptionText ? descriptionText.trim() : 'Sem descrição disponível';

            let dateElement = $(el).find('.event_date, .date, .post_date').first();
            let dateText = dateElement.length > 0 ? dateElement.text().trim() : '';

            if (!dateText || dateText === '') {
                const titleTextForDate = titleElement.length > 0 ? titleElement.text().trim() : '';
                const h2DateMatch = titleTextForDate.match(/\d{1,2}\s*de\s*[a-zA-ZçÇ]+/i);
                if (h2DateMatch) {
                    dateText = h2DateMatch[0];
                }
            }

            if (!dateText || dateText === '') {
                try {
                    const fullText = (description + ' ' + title).replace(/\s+/g, ' ');
                    const dateMatch = fullText.match(/(?:[A-Za-z]+-feira,\s*)?(\d{1,2}(,\s*\d{1,2})*\s*(e|ou)\s*)?\d{1,2}\s*de\s*[a-zA-ZçÇ]+\s*(de\s*\d{4})?/i);
                    const shortDateMatch = fullText.match(/\d{1,2}\s*\/\s*\d{1,2}(\s*\/\s*\d{2,4})?/);
                    const monthYearMatch = fullText.match(/[a-zA-ZçÇ]+\s+(de\s+)?\d{4}/i);
                    const fallbackDateMatch = fullText.match(/\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}/);
                    const abbrevMonthMatch = fullText.match(/\d{1,2}\s*de\s*[a-zA-ZçÇ]{3}/i);

                    if (fallbackDateMatch) {
                        dateText = fallbackDateMatch[0];
                    } else if (abbrevMonthMatch) {
                        dateText = abbrevMonthMatch[0];
                    } else if (dateMatch) {
                        dateText = dateMatch[0];
                    } else if (shortDateMatch) {
                        dateText = shortDateMatch[0];
                    } else if (monthYearMatch) {
                        dateText = monthYearMatch[0];
                    } else if (image) {
                        const imageDateMatch = image.match(/images\/\d{4}(\d{2})(\d{2})\d+/);
                        if (imageDateMatch) {
                            const monthStr = imageDateMatch[1];
                            const dayStr = imageDateMatch[2];
                            const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                            const month = months[parseInt(monthStr, 10) - 1];
                            dateText = `${parseInt(dayStr, 10)} de ${month}`;
                        }
                    }

                    if (!dateText) {
                        const today = new Date();
                        const day = String(today.getDate()).padStart(2, '0');
                        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                        const month = months[today.getMonth()];
                        dateText = `${day} de ${month}`;
                    }
                } catch (dateErr) {
                    dateText = '';
                }
            }
            let date = dateText ? dateText : 'Sem informação de data';

            if (title && link) {
                let fullLink = link;
                if (link !== '#') {
                    try {
                        fullLink = new URL(link, 'https://diocesefranca.org.br/').href;
                    } catch (e) {
                        fullLink = link.startsWith('http') ? link : `https://diocesefranca.org.br/${link}`;
                    }
                }

                let fullImage = image;
                if (image) {
                    try {
                        fullImage = new URL(image, 'https://diocesefranca.org.br/').href;
                    } catch (e) {
                        fullImage = image.startsWith('http') ? image : image.startsWith('//') ? 'https:' + image : `https://diocesefranca.org.br/${image}`;
                    }
                } else {
                    fullImage = 'https://via.placeholder.com/400x200.png?text=Not%C3%ADcia+da+Diocese';
                }

                const isDuplicate = news.some(n => n.link === fullLink);
                if (!isDuplicate) {
                    news.push({ id: news.length + 1, title, category, description, link: fullLink, image: fullImage, date });
                }
            }
        } catch (err) {
            console.error(`Error parsing individual news element at index ${i}:`, err.message);
        }
    });

    const outputPath = path.join(DATA_DIR, 'news.json');
    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2));
    console.log(`Scraped ${news.length} news items. Output saved to ${outputPath}`);
    return news;

  } catch (error) {
    console.error('Error scraping news:', error.message);
    const outputPath = path.join(DATA_DIR, 'news.json');
    if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    }
    return [];
  }
};

/**
 * Helper to fetch parish pages from https://diocesefranca.org.br/ with retries
 */
async function fetchPage(id) {
  const pageUrl = `${SITE}/?menu=noticia_detalhe&id=${id}&id_orgao=1`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await axios.get(pageUrl, {
        timeout: 25000,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://diocesefranca.org.br/'
        }
      });
      return res.data;
    } catch (error) {
      await wait(1000 * attempt);
    }
  }
  return '';
}

/**
 * Scrapes diocese catalog data (parishes, priests, mass schedules) from https://diocesefranca.org.br/
 */
const scrapeCatalog = async () => {
  console.log('Starting diocese catalog scraping (parishes, priests, masses)...');
  const FIRST_ID = 2030;
  const LAST_ID = 2400;
  const BISHOP_PAGE_ID = 1865;
  const SEAT_ID = 2080;
  const CITY_FILE = path.join(DATA_DIR, 'cityCoords.json');

  const normalizeName = (name) =>
    name
      .replace(/\s+/g, ' ')
      .replace(/^Pe\.?\s+/i, 'Pe. ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/,\s*([A-Za-z]{2,5})\s*$/, (_, order) => `, ${order.toUpperCase()}`)
      .trim();

  // Crawl parish pages
  const ids = Array.from({ length: LAST_ID - FIRST_ID }, (_, i) => FIRST_ID + i);
  const parishes = [];
  for (let i = 0; i < ids.length; i += 6) {
    const pages = await Promise.all(ids.slice(i, i + 6).map(async (id) => [id, await fetchPage(id)]));
    pages.forEach(([id, html]) => {
      const parish = html && parseParish(html, id);
      if (parish) parishes.push(parish);
    });
  }

  parishes.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  // Load city coordinates cache
  const cityCache = fs.existsSync(CITY_FILE) ? JSON.parse(fs.readFileSync(CITY_FILE, 'utf8')) : {};

  const churches = parishes.map(({ sourceId, clergy, masses, ...p }) => {
    const [latitude, longitude] = cityCache[`${p.city}|${p.state}`] || [null, null];
    return { id: sourceId, ...p, latitude, longitude, coordinatesVerified: false, coordinatesPrecision: 'city' };
  });

  const massList = [];
  parishes.forEach((p) => p.masses.forEach((m) => massList.push({
    id: massList.length + 1,
    churchId: p.sourceId,
    dayOfWeek: m.dayOfWeek,
    time: m.time,
    type: m.dayOfWeek === 'Domingo' ? 'Missa Dominical' : 'Missa Semanal',
  })));

  // Parse bishop page
  const priests = [];
  const bishopHtml = await fetchPage(BISHOP_PAGE_ID);
  if (bishopHtml) {
    const text = htmlToText(bishopHtml);
    const name = (text.match(/Bispo atual\s*-\s*(Dom [^\n]+)/) || [])[1];
    if (name) {
      const born = (text.match(/Nascido em ([^-\n]+)- (\d{2}\/\d{2}\/\d{4})/) || []).slice(1);
      const seat = (text.match(/Nomeado Bispo de Franca[^\n]*\n\s*Posse:\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1];
      const phone = (text.match(/Fone:\s*(\(\d{2}\)\s?\d{4}-\d{4})/) || [])[1];
      const bio = [`${(text.match(/(\d)º Bispo Diocesano/) || [])[1] || ''}º Bispo Diocesano de Franca`.replace(/^º /, ''),
        born.length ? `nascido em ${born[0].trim()} (${born[1]})` : '', seat ? `com posse em ${seat}` : '']
        .filter(Boolean).join(', ') + '.';
      priests.push({ id: 1, name: name.trim(), title: 'Bispo Diocesano', churchId: SEAT_ID, email: null, phone: phone || null, bio, image: null });
    }
  }

  const seen = new Set(priests.map((p) => p.name));
  parishes.forEach((p) => p.clergy.forEach((c) => {
    const name = normalizeName(c.name);
    if (seen.has(name)) return;
    seen.add(name);
    priests.push({
      id: priests.length + 1,
      name,
      title: c.title,
      churchId: p.sourceId,
      email: p.email,
      phone: p.phone,
      bio: `${c.title} da ${p.name} (${p.city}/${p.state}).`,
      image: null,
    });
  }));

  if (churches.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'churches.json'), JSON.stringify(churches, null, 2) + '\n');
    fs.writeFileSync(path.join(DATA_DIR, 'masses.json'), JSON.stringify(massList, null, 2) + '\n');
    fs.writeFileSync(path.join(DATA_DIR, 'priests.json'), JSON.stringify(priests, null, 2) + '\n');
    console.log(`Scraped Catalog: ${churches.length} parishes, ${priests.length} priests/deacons, ${massList.length} mass schedules.`);
  } else {
    console.warn('Scrape catalog returned 0 churches (network offline or block). Keeping existing files.');
  }

  return { churches, priests, masses: massList };
};

/**
 * Runs both news and catalog scraping
 */
const scrapeAll = async () => {
  console.log('--- Starting Full Scrape for Diocese de Franca (News, Parishes, Priests, Masses) ---');
  const news = await scrapeNews();
  const catalog = await scrapeCatalog();
  console.log('--- Full Scrape Completed Successfully ---');
  return { news, ...catalog };
};

if (require.main === module) {
  scrapeAll().then(() => {
    console.log('Scraper finished execution.');
  }).catch((err) => {
    console.error('Fatal error during scraping:', err.message);
  });
}

module.exports = {
  scrapeNews,
  scrapeCatalog,
  scrapeAll
};
