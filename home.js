const API_KEY = '57ebea8e5cdcf68d4e8f4d20ca5bd4ac';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// 🔥 Fetch trending content
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

// 🔥 Fetch trending anime (filter Japanese + Animation genre)
async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

// ✅ Display banner
function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

// ✅ Display movie list
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ✅ Show movie details in modal
function showDetails(item) {
  currentItem = item;
  if (!item.media_type) item.media_type = item.title ? 'movie' : 'tv';

  const type = item.media_type;
  const url = `${window.location.origin}/watch?type=${type}&id=${item.id}`;
  window.history.pushState({item}, '', url);
  
  document.getElementById('modal').style.display = 'flex';
}

// ✅ Change video source based on dropdown
function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.xyz") {
    embedURL = `https://vidsrc.xyz/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "pstream") {
    embedURL = `https://pstream.to/e/${currentItem.id}`;
  } else if (server === "2embed") {
    embedURL = `https://2embed.cc/embed/${currentItem.id}`;
  } else if (server === "videasy") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

// ✅ Close modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
  window.history.pushState({}, '', '/');
}

// ✅ Search bar open/close
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

// ✅ TMDB Search function
async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();
  const container = document.getElementById('search-results');
  container.innerHTML = '';

  data.results.forEach(item => {
    if (!item.poster_path) return;

    const wrapper = document.createElement('div');
    wrapper.style.width = '120px';
    wrapper.style.textAlign = 'center';

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.style.width = '100%';
    img.style.borderRadius = '5px';
    img.style.cursor = 'pointer';
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };

    const title = document.createElement('p');
    const name = item.title || item.name;
    const date = item.release_date || item.first_air_date || '';
    const year = date ? ` (${new Date(date).getFullYear()})` : '';
    title.textContent = name + year;
    title.style.fontSize = '12px';
    title.style.color = '#ccc';

    wrapper.appendChild(img);
    wrapper.appendChild(title);
    container.appendChild(wrapper);
  });
}

// ✅ Initial load
async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

// ✅ Load from URL
window.addEventListener('DOMContentLoaded', async () => {
  const isAccepted = localStorage.getItem('disclaimerAccepted');
  const popup = document.getElementById('disclaimer-popup');
  const main = document.getElementById('main-content');

  if (isAccepted === 'true') {
    popup.style.display = 'none';
    main.style.display = 'block';
    document.body.style.overflow = 'auto';
  } else {
    main.style.display = 'none';
    document.body.style.overflow = 'hidden';
  }

  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  if (type && id) {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const item = await res.json();
    item.media_type = type;
    showDetails(item);
  }

  await init(); // Load movie lists
});

// ✅ Back button closes modal
window.addEventListener('popstate', () => {
  closeModal();
});

// ✅ Accept disclaimer
function acceptDisclaimer() {
  localStorage.setItem('disclaimerAccepted', 'true');
  document.getElementById('disclaimer-popup').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  document.body.style.overflow = 'auto';
}
