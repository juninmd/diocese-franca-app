const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const scrapeNews = async () => {
  try {
    const { data } = await axios.get('https://diocesefranca.org.br/');
    const $ = cheerio.load(data);
    const news = [];

    // The layout has list items (li) containing the news.
    // Inside, there is <div class="scale_image_container"> and <div class="post_text">.
    $('.post_text').each((i, el) => {
        const titleElement = $(el).find('h2.post_title a');
        if (titleElement.length === 0) return;

        const title = titleElement.text().trim();
        let link = titleElement.attr('href');

        // Find the image in the previous sibling or parent context
        const parentLi = $(el).closest('li');
        const imgTag = parentLi.find('.scale_image_container img.scale_image');
        let image = imgTag.attr('src');

        if (title && link && link.includes('noticia_detalhe') && image) {
            // Make link absolute
            const fullLink = `https://diocesefranca.org.br/${link}`;
            const fullImage = `https://diocesefranca.org.br/${image}`;

            // Check for duplicates
            const isDuplicate = news.some(n => n.link === fullLink);
            if (!isDuplicate) {
                 news.push({ id: news.length + 1, title, link: fullLink, image: fullImage });
            }
        }
    });

    const outputPath = path.join(__dirname, 'data', 'news.json');
    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2));
    console.log(`Scraped ${news.length} news items. Output saved to ${outputPath}`);

  } catch (error) {
    console.error('Error scraping news:', error.message);
  }
};

scrapeNews();
