const API_KEY = '57ebea8e5cdcf68d4e8f4d20ca5bd4ac';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item => item.original_language === 'ja' && item.genre_ids.includes(16));
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  if (!item.media_type) item.media_type = item.title ? "movie" : "tv";
  const type = item.media_type || (item.title ? "movie" : "tv");
  const url = `${window.location.origin}/watch?type=${type}&id=${item.id}`;
  window.history.pushState({item}, '', url); 
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round((item.vote_average || 0) / 2));
  document.getElementById('modal').style.display = 'flex';
  changeServer();
  loadRecommended(item.id);
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
   else if (server === "2embed") {
    embedURL = `https://2embed.cc/embed/${currentItem.id}`;
  } 
   else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
  window.history.pushState({}, '', '/');
  
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}

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
    title.style.marginTop = '5px';
    title.style.color = 'white';

    wrapper.appendChild(img);
    wrapper.appendChild(title);
    container.appendChild(wrapper);
  });
}
  
async function loadRecommended(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`);
  const data = await res.json();
  const list = document.getElementById("recommended-list");
  list.innerHTML = '';
  data.results.slice(0, 10).forEach(item => {
    const img = document.createElement("img");
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title;
    img.onclick = () => showDetails(item);
    list.appendChild(img);
  });
}

async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}
init();

let sliderIndex = 0;
let sliderItems = [];

function updateSlider() {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((s, i) => {
    s.classList.remove("active");
    if (i === sliderIndex) s.classList.add("active");
  });
  sliderIndex = (sliderIndex + 1) % slides.length;
}

async function loadSlider() {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await res.json();
  sliderItems = data.results.slice(0, 5);
  const slider = document.getElementById("slider");
  slider.innerHTML = "";
  sliderItems.forEach((item, i) => {
    const slide = document.createElement("div");
    slide.className = "slide" + (i === 0 ? " active" : "");
    slide.style.backgroundImage = `url(${IMG_URL + item.backdrop_path})`;
    slide.innerHTML = `<h1>${item.title}</h1>`;
    slider.appendChild(slide);
  });
  setInterval(updateSlider, 5000);
}
loadSlider();
 // === Disclaimer Logic ===
function acceptDisclaimer() {
  document.getElementById('disclaimer-popup').style.display = 'none';
  localStorage.setItem('disclaimerAccepted', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
  const accepted = localStorage.getItem('disclaimerAccepted');
  if (!accepted) {
    document.getElementById('disclaimer-popup').style.display = 'flex';
  }
});
 window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');

  if (type && id) {
    // Fetch movie or tv show data from TMDB
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const item = await res.json();

    // Add type if missing (important for video embed)
    item.media_type = type;

    // Show modal
    showDetails(item);
  }
});


