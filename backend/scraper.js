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
            if (titleElement.length === 0) return;

            const title = titleElement.text().trim();
            let link = titleElement.attr('href') || '';

            // Find the image in the context
            const imgTag = $(el).find('.scale_image_container img.scale_image');
            let image = imgTag.attr('src') || '';

            // Attempt to find a date if available, typically in small or span tags inside post_title or similar
            const dateElement = $(el).find('.post_date').first();
            const date = dateElement.length > 0 ? dateElement.text().trim() : 'Sem informação de data';

            const descriptionElement = $(el).find('.post_text p').first();
            const description = descriptionElement.length > 0 ? descriptionElement.text().trim() : 'Sem descrição disponível';

            if (title && link && link.includes('noticia_detalhe')) {
                // Make link absolute
                const fullLink = link.startsWith('http') ? link : `https://diocesefranca.org.br/${link}`;
                const fullImage = image ? (image.startsWith('http') ? image : `https://diocesefranca.org.br/${image}`) : '';

                // Check for duplicates
                const isDuplicate = news.some(n => n.link === fullLink);
                if (!isDuplicate) {
                    news.push({ id: news.length + 1, title, description, link: fullLink, image: fullImage, date });
                }
            }
        } catch (err) {
            console.error('Error parsing individual news element:', err.message);
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
  }
};

scrapeNews();
