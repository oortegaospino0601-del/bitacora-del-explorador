// Safe-zone QA with the campaign's margins: nothing in the top 10 %, bottom 25 % or right 12 % of 1080x1920.
// Reuses the engine's text probe (every fillText, measured on screen) but swaps in these exact margins.
const U = require('../engine/util');
U.safeArea = () => ({ x: 0, y: Math.round(1920 * 0.10), w: Math.round(1080 * 0.88), h: Math.round(1920 * 0.75) - Math.round(1920 * 0.10) });
process.argv = [process.argv[0], require('path').join(__dirname, '../engine/render.js'), 'qa', ...process.argv.slice(2)];
require('../engine/render.js');
