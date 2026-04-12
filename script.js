const API_BASE_URL = "https://api.jikan.moe/v4/anime";
const THEME_KEY = "anime-recommend-theme";

const genreSelect = document.getElementById("genreSelect");
const scoreSelect = document.getElementById("scoreSelect");
const searchInput = document.getElementById("searchInput");
const recommendButton = document.getElementById("recommendButton");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");
const resultsGrid = document.getElementById("resultsGrid");
const resultsMeta = document.getElementById("resultsMeta");
const themeToggle = document.getElementById("themeToggle");

let animeList = [];
let filteredAnime = [];
let requestController = null;

initializeApp();

function initializeApp() {
  applySavedTheme();
  attachEventListeners();
}

function attachEventListeners() {
  recommendButton.addEventListener("click", fetchRecommendations);

  searchInput.addEventListener("input", () => {
    renderResults();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      renderResults();
    }
  });

  themeToggle.addEventListener("click", toggleTheme);
}

async function fetchRecommendations() {
  if (requestController) {
    requestController.abort();
  }

  requestController = new AbortController();
  setLoadingState(true);
  hideMessages();
  resultsGrid.innerHTML = "";
  resultsMeta.textContent = "Loading recommendations...";

  const genre = genreSelect.value;
  const minScore = scoreSelect.value;
  const url = `${API_BASE_URL}?genres=${genre}&order_by=score&sort=desc&limit=12&min_score=${minScore}`;

  try {
    const response = await fetch(url, { signal: requestController.signal });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Unable to load recommendations right now.");
    }

    animeList = Array.isArray(result.data) ? result.data : [];
    renderResults();
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    animeList = [];
    filteredAnime = [];
    resultsGrid.innerHTML = "";
    emptyState.textContent = getErrorMessage(error);
    emptyState.classList.remove("hidden");
    resultsMeta.textContent = "Request failed";
  } finally {
    setLoadingState(false);
    requestController = null;
  }
}

function renderResults() {
  const searchValue = searchInput.value.trim().toLowerCase();

  filteredAnime = animeList.filter((anime) =>
    anime.title.toLowerCase().includes(searchValue)
  );

  resultsGrid.innerHTML = "";

  if (animeList.length === 0) {
    if (!loading.classList.contains("hidden")) {
      return;
    }

    emptyState.classList.remove("hidden");
    noResults.classList.add("hidden");
    resultsMeta.textContent = "Choose your preferences and load recommendations.";
    return;
  }

  if (filteredAnime.length === 0) {
    emptyState.classList.add("hidden");
    noResults.classList.remove("hidden");
    resultsMeta.textContent = `${animeList.length} anime loaded, 0 match the title filter`;
    return;
  }

  hideMessages();
  resultsMeta.textContent = `${filteredAnime.length} recommendations shown`;
  resultsGrid.innerHTML = filteredAnime.map((anime) => createAnimeCard(anime)).join("");
}

function createAnimeCard(anime) {
  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || createPlaceholderImage(anime.title);
  const safeTitle = escapeHtml(anime.title);
  const safeSynopsis = escapeHtml(getShortSynopsis(anime.synopsis));
  const genres = Array.isArray(anime.genres) ? anime.genres.slice(0, 2).map((genre) => genre.name) : [];

  return `
    <article class="anime-card">
      <div class="anime-image-wrap">
        <img class="anime-image" src="${imageUrl}" alt="${safeTitle}" loading="lazy">
      </div>
      <div class="anime-body">
        <h3 class="anime-title">${safeTitle}</h3>
        <div class="anime-meta">
          <span class="meta-chip">Score ${anime.score ?? "N/A"}</span>
          <span class="meta-chip">${escapeHtml(anime.type || "Unknown")}</span>
          ${genres.map((genre) => `<span class="meta-chip">${escapeHtml(genre)}</span>`).join("")}
        </div>
        <p class="anime-description">${safeSynopsis}</p>
        <a class="anime-link" href="${anime.url}" target="_blank" rel="noopener noreferrer">View Details</a>
      </div>
    </article>
  `;
}

function getShortSynopsis(synopsis = "") {
  if (!synopsis || !synopsis.trim()) {
    return "No synopsis available for this anime.";
  }

  const normalizedText = synopsis.replace(/\s+/g, " ").trim();
  return normalizedText.length > 180
    ? `${normalizedText.slice(0, 180).trim()}...`
    : normalizedText;
}

function createPlaceholderImage(title = "Anime") {
  const safeLabel = escapeHtml(title.slice(0, 20));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1e88e5" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ff6b35" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" rx="32" fill="url(#g)" />
      <circle cx="200" cy="165" r="70" fill="rgba(255,255,255,0.18)" />
      <rect x="80" y="280" width="240" height="26" rx="13" fill="rgba(255,255,255,0.2)" />
      <text x="200" y="420" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="700">
        ${safeLabel}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\n/g, "").trim())}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getErrorMessage(error) {
  const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";

  if (message.includes("rate limit")) {
    return "The anime API is temporarily rate-limited. Please wait a moment and try again.";
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Unable to reach the anime service right now. Check your connection and try again.";
  }

  return "Something went wrong while loading anime recommendations.";
}

function setLoadingState(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
  recommendButton.disabled = isLoading;
  recommendButton.textContent = isLoading ? "Loading..." : "Get Recommendations";
}

function hideMessages() {
  emptyState.classList.add("hidden");
  noResults.classList.add("hidden");
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  themeToggle.setAttribute("aria-pressed", String(savedTheme === "dark"));
  updateThemeLabel(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  const nextTheme = isDark ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  updateThemeLabel(nextTheme);
}

function updateThemeLabel(theme) {
  themeToggle.querySelector(".theme-toggle__label").textContent =
    theme === "dark" ? "Light mode" : "Dark mode";
}
