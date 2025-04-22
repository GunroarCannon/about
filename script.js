const API_URL = "https://link-previewer-efsv.onrender.com/preview?url=";
const FALLBACK_IMAGE = "fallback.jpg";
const CACHE_KEY = "linkPreviewCache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Initialize cache if it doesn't exist
function initCache() {
  if (!localStorage.getItem(CACHE_KEY)) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({}));
  }
}

// Get cached preview
function getCachedPreview(url) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
  const cachedItem = cache[url];
  
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data;
  }
  return null;
}

// Save preview to cache
function cachePreview(url, previewData) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
  cache[url] = {
    data: previewData,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// Modified fetchPreview with caching
async function fetchPreview(url) {
  // Check cache first
  const cached = getCachedPreview(url);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(API_URL + encodeURIComponent(url));
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.title) throw new Error("Invalid preview data");

    const preview = {
      title: data.title,
      description: data.description || "No description available",
      image: data.image || FALLBACK_IMAGE,
      url: url
    };

    // Cache the successful response
    cachePreview(url, preview);
    return preview;
    
  } catch (error) {
    console.error(`Failed to fetch preview for ${url}:`, error);
    throw error;
  }
}

// Modified loadSection to handle cache
async function loadSection(sectionId, projects) {
  const container = document.getElementById(`${sectionId}-container`);
  if (!container) return;

  // Initialize cache on first run
  initCache();

  // Create all cards immediately with cached data or fallbacks
  projects.forEach(project => {
    const cached = getCachedPreview(project.url);
    const fallback = {
      title: project.fallback?.title || new URL(project.url).hostname,
      description: project.description || "Click to view content",
      image: project.fallback?.image || FALLBACK_IMAGE,
      url: project.url
    };
    
    createCard(cached || fallback, container);
  });

  // Then try to update each with fresh data
  for (const project of projects) {
    try {
      const preview = await fetchPreview(project.url);
      // Update the card if we got fresh data
      updateCard(project.url, preview, container);
    } catch (error) {
      console.warn(`Failed to update preview for ${project.url}:`, error);
      // Keep the cached/fallback version
    }
  }
}

// Helper function to update existing card
function updateCard(url, preview, container) {
  const cards = container.querySelectorAll('.card');
  for (const card of cards) {
    const cardUrl = card.querySelector('a').href;
    if (cardUrl === url) {
      card.innerHTML = `
        <img src="${preview.image}" 
             alt="${preview.title}" 
             onerror="this.src='${FALLBACK_IMAGE}'">
        <h3>${preview.title}</h3>
        <p>${preview.description}</p>
        <a href="${preview.url}" target="_blank">Visit →</a>
      `;
      break;
    }
  }
}

async function fetchPreview(url) {
  const response = await fetch(API_URL + encodeURIComponent(url));
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  
  const data = await response.json();
  if (!data.title) throw new Error("Invalid preview data");

  return {
    title: data.title,
    description: data.description || "No description available",
    image: data.image || FALLBACK_IMAGE,
    url: url
  };
}

function createCard(preview, container) {
  const card = document.createElement('div');
  card.className = 'card';// glow-on-hover';
  card.innerHTML = `
    <img src="${preview.image}" 
         alt="${preview.title}" 
         onerror="this.src='${FALLBACK_IMAGE}'">
    <h3>${preview.title}</h3>
    <p>${preview.description}</p>
    <a href="${preview.url}" target="_blank">Visit →</a>
  `;
  container.appendChild(card);
}

function showErrorUI() {
  document.querySelectorAll('.cards-container').forEach(container => {
    container.innerHTML = `
      <div class="error-notice">
        <p>Content failed to load. Please check your connection or 
        <a href="javascript:location.reload()">try again</a>.</p>
      </div>
    `;
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadAllProjects);