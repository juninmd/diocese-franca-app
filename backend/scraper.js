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

    // For this POC, let's grab text from any 'h2' or 'h3' that seems to have a link
    $('h2 a, h3 a').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).attr('href');
        if (title && title.length > 5 && link && link.includes('noticia_detalhe')) {
            news.push({ title, link });
        }
    });

    // If the above doesn't yield much, let's look for elements containing "Leia mais" and grab the closest title
    if (news.length === 0) {
        $('a:contains("Leia mais")').each((i, el) => {
            const container = $(el).closest('div'); // Guessing it's in a div container
            const titleEl = container.find('h2, h3, strong').first();
            let title = titleEl.text().trim();

            // fallback if no title element is found inside container
            if (!title) {
                // let's try getting the text node just before the paragraph containing the link
                const parentText = container.text().trim();
                // attempt to extract the first line
                title = parentText.split('\n')[0].trim();
            }

            const link = $(el).attr('href');
            if (title) {
                news.push({ title, link });
            }
        });
    }

    const outputPath = path.join(__dirname, 'data', 'news.json');
    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2));
    console.log(`Scraped ${news.length} news items. Output saved to ${outputPath}`);

  } catch (error) {
    console.error('Error scraping news:', error.message);
  }
};

scrapeNews();
