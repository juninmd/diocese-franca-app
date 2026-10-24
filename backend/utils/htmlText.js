const { decode } = require('html-entities');

// HTML -> texto com quebras de linha nos blocos (suficiente para as páginas do site da Diocese).
const htmlToText = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, '')
      .replace(/\s+/g, ' ') // quebras de linha do código-fonte são espaço; só <br> e blocos quebram linha
      .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ');

module.exports = { htmlToText };
