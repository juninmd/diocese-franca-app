const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
];

const scrapeNews = async () => {
  let data = null;
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
      try {
          const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
          const response = await axios.get('https://diocesefranca.org.br/', {
              headers: {
                  'User-Agent': randomUserAgent
              },
              timeout: 20000
          });
          data = response.data;
          break; // success, exit the loop
      } catch (err) {
          attempt++;
          console.error(`Attempt ${attempt} failed to fetch diocesefranca.org.br: ${err.message}`);
          if (attempt >= maxRetries) {
              throw err;
          }
          await wait(2000 * Math.pow(2, attempt));
      }
  }

  try {
    const $ = cheerio.load(data);
    const news = [];

    // The layout has list items (li) containing the news.
    // Inside, there is <div class="scale_image_container"> and <div class="post_text">.
    $('.section_post_left').each((i, el) => {
        try {
            let titleElement = $(el).find('h2.post_title a');
            let link = titleElement.length > 0 ? (titleElement.attr('href') || '#') : '#';
            let title = titleElement.length > 0 ? titleElement.text().trim() : '';

            if (!title) {
                // Fallback to the h2 text itself if a tag is empty or missing
                console.log('Fallback: h2.post_title a tag missing, using h2 text instead');
                titleElement = $(el).find('h2.post_title');
                title = titleElement.length > 0 ? titleElement.text().trim() : 'Sem título disponível';
            }

            // Find the image in the context
            const imgTag = $(el).find('.scale_image_container img.scale_image');
            let image = imgTag.length > 0 ? (imgTag.attr('src') || '') : '';

            const descriptionElement = $(el).find('.post_text p').first();
            const descriptionText = descriptionElement.length > 0 && descriptionElement.text().trim() !== '' ? descriptionElement.text().trim() : $(el).text().replace(/\s+/g, ' ').substring(0, 100).trim();
            const description = descriptionText ? descriptionText : 'Sem descrição disponível';

            // Attempt to find a date if available, typically in small or span tags inside post_title or similar
            let dateElement = $(el).find('.event_date, .date, .post_date').first();
            let dateText = dateElement.length > 0 ? dateElement.text().trim() : '';

            if (!dateText) {
                console.log('Fallback: date extraction using regex on title/description/image for: ', title.substring(0, 30) + '...');
                // Try parsing the date from the description or title using expanded regex
                // Matches "12 de Agosto", "12 de agosto de 2024", "12/08/2024", "12/08", "Agosto de 2024"
                const fullText = (description + ' ' + title).replace(/\s+/g, ' ');
                const dateMatch = fullText.match(/\d{1,2}\s+de\s+[a-zA-ZçÇ]+\s*(de\s*\d{4})?/i);
                const shortDateMatch = fullText.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/);
                const monthYearMatch = fullText.match(/[a-zA-ZçÇ]+\/\d{4}/i);

                if (dateMatch) {
                    dateText = dateMatch[0];
                    console.log('  -> Found date via regex (extenso):', dateText);
                } else if (shortDateMatch) {
                    dateText = shortDateMatch[0];
                    console.log('  -> Found date via regex (curto):', dateText);
                } else if (monthYearMatch) {
                    dateText = monthYearMatch[0];
                    console.log('  -> Found date via regex (mês/ano):', dateText);
                } else if (image) {
                    // Extract date from image URL (e.g. 20260812223051 -> 12 de agosto)
                    const imageDateMatch = image.match(/images\/\d{4}(\d{2})(\d{2})\d+/);
                    if (imageDateMatch) {
                        const monthStr = imageDateMatch[1];
                        const dayStr = imageDateMatch[2];
                        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                        const month = months[parseInt(monthStr, 10) - 1];
                        dateText = `${parseInt(dayStr, 10)} de ${month}`;
                        console.log('  -> Found date via image URL fallback:', dateText);
                    }
                }
            }
            const date = dateText ? dateText : 'Sem informação de data';

            if (title && link) {
                // Make link absolute using URL object
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
                        fullImage = image.startsWith('http') ? image : `https://diocesefranca.org.br/${image}`;
                    }
                }

                // Check for duplicates
                const isDuplicate = news.some(n => n.link === fullLink);
                if (!isDuplicate) {
                    news.push({ id: news.length + 1, title, description, link: fullLink, image: fullImage, date });
                }
            }
        } catch (err) {
            console.error(`Error parsing individual news element at index ${i}:`, err.message);
        }
    });

    const outputPath = path.join(__dirname, 'data', 'news.json');
    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2));
    console.log(`Scraped ${news.length} news items. Output saved to ${outputPath}`);

  } catch (error) {
    console.error('Error scraping news:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    // Provide a graceful fallback to an empty array so that the frontend doesn't crash on undefined
    const outputPath = path.join(__dirname, 'data', 'news.json');
    if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
        console.log(`Fallback: Created empty news.json at ${outputPath}`);
    } else {
        console.log(`Fallback: news.json already exists at ${outputPath}, leaving it intact.`);
    }
  }
};

if (require.main === module) {
  scrapeNews().then(() => {
    console.log('Scraper finished execution.');
  });
}

module.exports = scrapeNews;
