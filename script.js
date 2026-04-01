const API_BASE_URL = "https://api.jikan.moe/v4/characters?q=";
const FAVORITES_KEY = "find-anime-character-favorites";
const THEME_KEY = "find-anime-character-theme";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const sortSelect = document.getElementById("sortSelect");
const filterInput = document.getElementById("filterInput");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");
const resultsGrid = document.getElementById("resultsGrid");
const resultsMeta = document.getElementById("resultsMeta");
const themeToggle = document.getElementById("themeToggle");
const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesEmpty = document.getElementById("favoritesEmpty");

let fetchedCharacters = [];
let displayedCharacters = [];
let favorites = loadFavorites();

initializeApp();

function initializeApp() {
  applySavedTheme();
  renderFavorites();
  attachEventListeners();
}

function attachEventListeners() {
  searchButton.addEventListener("click", () => performSearch(searchInput.value.trim()));

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch(searchInput.value.trim());
    }
  });

  searchInput.addEventListener(
    "input",
    debounce((event) => {
      const query = event.target.value.trim();
      if (query.length >= 2) {
        performSearch(query);
      }

      if (query.length === 0) {
        clearResultsView("Search for an anime character to see results here.");
      }
    }, 300)
  );

  sortSelect.addEventListener("change", renderResults);
  filterInput.addEventListener("input", renderResults);
  themeToggle.addEventListener("click", toggleTheme);
}

async function performSearch(query) {
  if (!query) {
    clearResultsView("Please enter a character name to search.");
    return;
  }

  setLoadingState(true);
  hideMessages();

  try {
    const response = await fetch(`${API_BASE_URL}${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("Unable to fetch anime characters right now.");
    }

    const result = await response.json();
    fetchedCharacters = Array.isArray(result.data) ? result.data : [];

    renderResults();
  } catch (error) {
    fetchedCharacters = [];
    displayedCharacters = [];
    resultsGrid.innerHTML = "";
    emptyState.textContent = "Something went wrong while fetching data. Please try again.";
    emptyState.classList.remove("hidden");
    noResults.classList.add("hidden");
    resultsMeta.textContent = error.message;
  } finally {
    setLoadingState(false);
  }
}

function renderResults() {
  const filterValue = filterInput.value.trim().toLowerCase();

  const filteredCharacters = fetchedCharacters.filter((character) =>
    character.name.toLowerCase().includes(filterValue)
  );

  const sortedCharacters = filteredCharacters.sort((first, second) => {
    const firstName = first.name.toLowerCase();
    const secondName = second.name.toLowerCase();

    return sortSelect.value === "za"
      ? secondName.localeCompare(firstName)
      : firstName.localeCompare(secondName);
  });

  displayedCharacters = sortedCharacters;
  resultsGrid.innerHTML = "";

  if (fetchedCharacters.length === 0) {
    noResults.classList.remove("hidden");
    emptyState.classList.add("hidden");
    resultsMeta.textContent = "0 characters found";
    return;
  }

  if (displayedCharacters.length === 0) {
    noResults.textContent = "No results match the current filter.";
    noResults.classList.remove("hidden");
    emptyState.classList.add("hidden");
    resultsMeta.textContent = `${fetchedCharacters.length} characters found, 0 match the filter`;
    return;
  }

  noResults.classList.add("hidden");
  emptyState.classList.add("hidden");

  resultsMeta.textContent = `${displayedCharacters.length} of ${fetchedCharacters.length} characters shown`;

  const cards = displayedCharacters.map((character) => createCharacterCard(character)).join("");
  resultsGrid.innerHTML = cards;

  resultsGrid.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", () => {
      const characterId = Number(button.dataset.id);
      toggleFavorite(characterId);
    });
  });
}

function createCharacterCard(character) {
  const isSaved = favorites.some((favorite) => favorite.mal_id === character.mal_id);
  const description = getShortDescription(character.about);
  const imageUrl = character.images?.jpg?.image_url || createPlaceholderImage(character.name);
  const safeName = escapeHtml(character.name);
  const safeDescription = escapeHtml(description);

  return `
    <article class="card">
      <div class="card-image-wrap">
        <img class="card-image" src="${imageUrl}" alt="${safeName}">
      </div>
      <div class="card-body">
        <h3 class="card-title">${safeName}</h3>
        <p class="card-description">${safeDescription}</p>
        <div class="card-actions">
          <button
            class="favorite-button ${isSaved ? "is-saved" : ""}"
            type="button"
            data-id="${character.mal_id}"
          >
            ${isSaved ? "Saved" : "Save Favorite"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFavorites() {
  favoritesGrid.innerHTML = "";

  if (favorites.length === 0) {
    favoritesEmpty.classList.remove("hidden");
    return;
  }

  favoritesEmpty.classList.add("hidden");

  favoritesGrid.innerHTML = favorites
    .map((character) => {
      const imageUrl = character.images?.jpg?.image_url || createPlaceholderImage(character.name);
      const safeName = escapeHtml(character.name);
      const safeDescription = escapeHtml(getShortDescription(character.about));

      return `
        <article class="favorite-card">
          <div class="favorite-image-wrap">
            <img class="favorite-image" src="${imageUrl}" alt="${safeName}">
          </div>
          <div class="favorite-body">
            <h3 class="favorite-title">${safeName}</h3>
            <p class="favorite-description">${safeDescription}</p>
            <div class="favorite-actions">
              <button class="remove-button" type="button" data-id="${character.mal_id}">
                Remove Favorite
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  favoritesGrid.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", () => {
      const characterId = Number(button.dataset.id);
      toggleFavorite(characterId);
    });
  });
}

function toggleFavorite(characterId) {
  const existingFavorite = favorites.find((character) => character.mal_id === characterId);

  if (existingFavorite) {
    favorites = favorites.filter((character) => character.mal_id !== characterId);
  } else {
    const characterToSave = fetchedCharacters.find((character) => character.mal_id === characterId);

    if (!characterToSave) {
      return;
    }

    favorites = [characterToSave, ...favorites];
  }

  saveFavorites();
  renderFavorites();
  renderResults();
}

function loadFavorites() {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getShortDescription(description = "") {
  if (!description.trim()) {
    return "No description available for this character yet.";
  }

  const normalizedText = description.replace(/\s+/g, " ").trim();
  return normalizedText.length > 170
    ? `${normalizedText.slice(0, 170).trim()}...`
    : normalizedText;
}

function createPlaceholderImage(name = "Character") {
  const safeLabel = escapeHtml(name.slice(0, 22));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1e88e5" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ff6b35" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" rx="32" fill="url(#g)" />
      <circle cx="200" cy="170" r="72" fill="rgba(255,255,255,0.2)" />
      <rect x="88" y="280" width="224" height="28" rx="14" fill="rgba(255,255,255,0.22)" />
      <text x="200" y="420" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="26" font-weight="700">
        ${safeLabel}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\n/g, "").trim())}`;
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setLoadingState(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
  searchButton.disabled = isLoading;
  searchButton.textContent = isLoading ? "Searching..." : "Search";
}

function hideMessages() {
  emptyState.classList.add("hidden");
  noResults.classList.add("hidden");
}

function clearResultsView(message) {
  fetchedCharacters = [];
  displayedCharacters = [];
  resultsGrid.innerHTML = "";
  noResults.classList.add("hidden");
  emptyState.textContent = message;
  emptyState.classList.remove("hidden");
  resultsMeta.textContent = "Search for an anime character to get started.";
}

function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  updateThemeLabel(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  const nextTheme = isDark ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  updateThemeLabel(nextTheme);
}

function updateThemeLabel(theme) {
  const label = theme === "dark" ? "Light mode" : "Dark mode";
  themeToggle.querySelector(".theme-toggle__label").textContent = label;
}
