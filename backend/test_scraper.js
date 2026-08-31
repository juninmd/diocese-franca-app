const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const response = await axios.get('https://diocesefranca.org.br/');
    const $ = cheerio.load(response.data);
    $('.section_post_left').each((i, el) => {
        const h2 = $(el).find('h2.post_title').html();
        console.log(`Item ${i} - Title HTML: ${h2}`);
        const date = $(el).find('.event_date').text();
        console.log(`Item ${i} - Date: ${date}`);
    });
}
test();
