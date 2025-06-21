const API_KEY = '57ebea8e5cdcf68d4e8f4d20ca5bd4ac';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const TRENDING = { movie: '/trending/movie/week', tv: '/trending/tv/week' };
const ANIME_URL = 'https://api.jikan.moe/v4/top/anime';

let currentType = 'movie';

async function fetchTMDB(endpoint) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${API_KEY}`);
  return res.ok ? res.json() : { results: [] };
}

async function fetchAnime() {
  const res = await fetch(ANIME_URL);
  return res.ok ? res.json() : { data: [] };
}

function createCard(item, type) {
  const imgPath = type === 'anime' ? item.images.jpg.image_url : IMG_URL + item.poster_path;
  
  if (!imgPath || imgPath.includes("null")) return null; // ✅ Skip broken poster

  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<img src="${imgPath}" alt="${item.title || item.name}" />`;
  div.addEventListener('click', () => showDetails(item, type));
  return div;
}

async function loadSection(type) {
  currentType = type;
  const rowWrapper = document.getElementById('rows-wrapper');
  rowWrapper.innerHTML = '';
  document.getElementById('banner-title').textContent = 'Loading...';

  let items = [];
  if (type === 'anime') {
    const anime = await fetchAnime();
    items = anime.data.slice(0, 10);
  } else {
    const tmdb = await fetchTMDB(TRENDING[type]);
    items = tmdb.results;
  }
  
  console.log("Fetched items:", items); // 
  const banner = items[0];
  document.getElementById('banner').style.backgroundImage = banner?.backdrop_path || banner?.images?.jpg?.image_url
    ? `url(${type === 'anime' ? banner.images.jpg.image_url : IMG_URL + banner.backdrop_path})`
    : '';
  document.getElementById('banner-title').textContent = banner?.title || banner?.name;

  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<h2>${type.toUpperCase()}</h2><div class="list"></div>`;
  items.forEach(item => row.querySelector('.list').appendChild(createCard(item, type)));
  rowWrapper.appendChild(row);
}

async function showDetails(item, type) {
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('modal-poster').src = type === 'anime'
    ? item.images.jpg.image_url
    : IMG_URL + item.poster_path;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-overview').textContent = item.overview || item.synopsis || '';
  document.getElementById('modal-vote').innerText = `⭐ ${(item.vote_average || item.score).toFixed(1)}`;

  const wrapper = document.getElementById('video-wrapper');
  wrapper.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${item.id}" frameborder="0" allowfullscreen></iframe>`;
}

function closeModals() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('search-modal').style.display = 'none';
}

document.getElementById('modal-close').onclick = closeModals;
document.getElementById('search-close').onclick = closeModals;
window.onclick = e => {
  if (e.target === document.getElementById('modal') || e.target === document.getElementById('search-modal')) closeModals();
};

document.getElementById('btn-trending').onclick = () => loadSection('movie');
document.getElementById('btn-tv').onclick = () => loadSection('tv');
document.getElementById('btn-anime').onclick = () => loadSection('anime');

document.getElementById('search-input').onkeypress = e => {
  if (e.key === 'Enter') {
    document.getElementById('search-modal').style.display = 'flex';
    document.getElementById('search-bar-input').focus();
  }
};

document.getElementById('search-bar-input').oninput = async function() {
  const q = this.value.trim();
  const results = document.getElementById('search-results');
  results.innerHTML = q.length < 3 ? '' : '';
};

loadSection('movie');
