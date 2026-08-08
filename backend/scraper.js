const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const scrapeNews = async () => {
  try {
    const { data } = await axios.get('https://diocesefranca.org.br/');
    const $ = cheerio.load(data);

    // the layout suggests that news items are within some structure where the title might be wrapped in specific elements,
    // let's grab the titles that precede the "Leia mais" links or similar news headers.
    const news = [];

    // Find all links that might be news articles based on their parent structure
    // Let's get the text of paragraphs just before the "Leia mais" link.
    // By looking at the view_text_website output, there are blocks of text describing the news
    // followed by "Leia mais". Let's extract any elements that look like titles.
    // In many Joomla/WordPress sites, titles are in h2, h3, or a tags with specific classes.
    // Let's use a generic approach to find headlines.

    // As a proof-of-concept, we'll try to find common title tags (h2, h3, etc) or specifically look for "Leia mais" links
    // and grab their previous sibling or parent elements' titles.

    $('.scale_image_container').each((i, el) => {
        const aTag = $(el).find('a').first();
        const link = aTag.attr('href');
        const imgTag = aTag.find('img.scale_image').first();
        let image = imgTag.attr('src');

        let title = '';

        // Find title inside the caption
        const captionInner = $(el).find('.caption_inner');
        if (captionInner.length > 0) {
            const h3 = captionInner.find('h3');
            if (h3.length > 0) {
                title = h3.text().trim();
            } else {
                const btn = captionInner.find('.button.banner_button');
                if (btn.length > 0) {
                    title = btn.text().trim();
                }
            }
        } else {
            // Find in adjacent post_image_buttons
            const nextDiv = $(el).next('.post_image_buttons');
            if (nextDiv.length > 0) {
                const btn = nextDiv.find('.button.banner_button');
                if (btn.length > 0) {
                    title = btn.text().trim();
                }
            }
        }

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
