const { applyDepara } = require('./applyDepara');
const depara = require('../data/depara.json');

// Catálogo servido pela API: dados base + de-para (data/depara.json).
module.exports = {
  churches: applyDepara(require('../data/churches.json'), depara.churches),
  priests: applyDepara(require('../data/priests.json'), depara.priests),
  masses: require('../data/masses.json'),
};
