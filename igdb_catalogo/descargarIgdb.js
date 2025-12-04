require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const OUTPUT_FILE = path.join(__dirname, 'catalogoVideojuegos_igdb.json');

const LIMIT = 50;   // máximo por request (puedes subirlo luego)
const OFFSET = 0;   // desde qué índice empezar (paginación básica)

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Faltan TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET en .env');
  }

  const url = 'https://id.twitch.tv/oauth2/token';
  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  const { data } = await axios.post(url, null, { params });
  return data.access_token;
}

function mapGameToCustomFormat(game) {
  return {
    id: game.id,
    slug: game.slug,
    titulo: game.name,
    plataformas: (game.platforms || []).map(p => p.name),
    precio: null, // IGDB no trae precio directamente
    calificacion: game.total_rating || game.rating || null,
    reseñas: [],
    favoritosCount: 0,
    sinopsis: game.summary || '',
    screenshots: (game.screenshots || []).map(s => s.url),
  };
}

async function fetchGames(accessToken) {
  const url = 'https://api.igdb.com/v4/games';

  const body = `
    fields id, slug, name, summary, total_rating, rating,
           platforms.name,
           screenshots.url;
    sort total_rating desc;
    limit ${LIMIT};
    offset ${OFFSET};
    where total_rating != null & screenshots != null;
  `;

  const headers = {
    'Client-ID': CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'text/plain',
  };

  const { data } = await axios.post(url, body, { headers });
  return data;
}

async function main() {
  try {
    console.log('Obteniendo access token de Twitch/IGDB...');
    const token = await getAccessToken();
    console.log('Token obtenido ✅');

    console.log('Consultando juegos en IGDB...');
    const games = await fetchGames(token);
    console.log(`Juegos recibidos de IGDB: ${games.length}`);

    const mapped = games.map(mapGameToCustomFormat);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapped, null, 2), 'utf8');
    console.log(`✅ Catálogo guardado en: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

main();
