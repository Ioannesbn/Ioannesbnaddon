const { publishToCentral } = require('stremio-addon-sdk');

// Substitua pelo seu domínio do Vercel após o deploy
const DOMAIN = process.argv[2] || 'seu-subdominio.vercel.app';
const MANIFEST_URL = `https://${DOMAIN}/manifest.json`;

console.log(`Publicando addon no catálogo central: ${MANIFEST_URL}`);

publishToCentral(MANIFEST_URL)
    .then(() => console.log('Publicado com sucesso!'))
    .catch(e => console.error('Erro ao publicar:', e.message));
