const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const scrapeNews = async () => {
  try {
    const { data } = await axios.get('https://diocesefranca.org.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    const $ = cheerio.load(data);
    const news = [];

    // The layout has list items (li) containing the news.
    // Inside, there is <div class="scale_image_container"> and <div class="post_text">.
    $('.section_post_left').each((i, el) => {
        try {
            const titleElement = $(el).find('h2.post_title a');
            const title = titleElement.length > 0 ? titleElement.text().trim() : 'Sem título disponível';
            let link = titleElement.length > 0 ? (titleElement.attr('href') || '#') : '#';

            // Find the image in the context
            const imgTag = $(el).find('.scale_image_container img.scale_image');
            let image = imgTag.length > 0 ? (imgTag.attr('src') || '') : '';

            const descriptionElement = $(el).find('.post_text p').first();
            const descriptionText = descriptionElement.length > 0 && descriptionElement.text().trim() !== '' ? descriptionElement.text().trim() : $(el).text().replace(/\s+/g, ' ').substring(0, 100).trim();
            const description = descriptionText ? descriptionText : 'Sem descrição disponível';

            // Attempt to find a date if available, typically in small or span tags inside post_title or similar
            const dateElement = $(el).find('.event_date').first();
            let dateText = dateElement.length > 0 ? dateElement.text().trim() : '';
            if (!dateText) {
                // Try parsing the date from the description or title
                const dateMatch = (description + ' ' + title).match(/\d{1,2} de [a-zA-Zç]+( de \d{4})?/i);
                const shortDateMatch = (description + ' ' + title).match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);

                if (dateMatch) {
                    dateText = dateMatch[0];
                } else if (shortDateMatch) {
                    dateText = shortDateMatch[0];
                } else {
                    const monthYearMatch = title.match(/[a-zA-Zç]+\/\d{4}/i);
                    if (monthYearMatch) {
                        dateText = monthYearMatch[0];
                    } else if (image) {
                        // Extract date from image URL (e.g. 20260812223051 -> 12 de agosto)
                        const imageDateMatch = image.match(/images\/\d{4}(\d{2})(\d{2})\d+/);
                        if (imageDateMatch) {
                            const monthStr = imageDateMatch[1];
                            const dayStr = imageDateMatch[2];
                            const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                            const month = months[parseInt(monthStr, 10) - 1];
                            dateText = `${parseInt(dayStr, 10)} de ${month}`;
                        }
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
