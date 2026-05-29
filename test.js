// test.js
// Uso: node test.js [tmdbId] [tipo] [temporada] [episodio] [provider]
// Ejemplos:
//   node test.js 550 movie
//   node test.js 157336 movie movie cinecalidad
//   node test.js 1396 tv 1 1 lamovie
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // Esto arregla el "fetch failed" para TODOS los providers

// 1. Captura de argumentos (Configuración por defecto)
const tmdbId = process.argv[2] || '157336';
const mediaType = process.argv[3] || 'movie';
const season = process.argv[4] ? parseInt(process.argv[4]) : null;
const episode = process.argv[5] ? parseInt(process.argv[5]) : null;
const providerName = process.argv[6] || 'lamovie'; // Aquí se decide qué archivo cargar

// 2. Importación Dinámica con manejo de errores
let getStreams;
try {
    const provider = require(`./providers/${providerName}.js`);
    getStreams = provider.getStreams;
    
    if (!getStreams) {
        throw new Error(`El proveedor "${providerName}" no exporta la función getStreams.`);
    }
} catch (e) {
    console.error(`\n❌ Error al cargar el proveedor: ${e.message}`);
    console.log(`Asegúrate de que existe el archivo: ./providers/${providerName}.js\n`);
    process.exit(1);
}

// 3. Ejecución del Test
console.log(`\n🚀 Probando proveedor: ${providerName.toUpperCase()}`);
console.log(`-----------------------------------------`);
console.log(`TMDB ID: ${tmdbId}`);
console.log(`Tipo:    ${mediaType}${season ? ` | S${season}E${episode}` : ''}`);
console.log(`-----------------------------------------\n`);

getStreams(tmdbId, mediaType, season, episode)
    .then(streams => {
        if (!streams || streams.length === 0) {
            console.log('❌ No se encontraron streams.');
            return;
        }
        console.log(`✅ Se encontraron ${streams.length} fuentes:\n`);
        streams.forEach((s, i) => {
            console.log(`[${i + 1}] ${s.title}`);
            console.log(`    URL: ${s.url.substring(0, 100)}...`);
            if (s.headers) console.log(`    Headers: ${JSON.stringify(s.headers)}`);
            console.log();
        });
    })
    .catch(e => {
        console.error('❌ Error durante la ejecución:', e.message);
    });