const API_URL = "https://link-previewer-efsv.onrender.com/preview?url=";
const FALLBACK_IMAGE = "fallback.jpg";

async function loadAllProjects() {
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error("Failed to load projects.json");
    const projectData = await response.json();

    await loadSection('websites', projectData.websites);
    await loadSection('games', projectData.games);
    await loadSection('art', projectData.art);
    
  } catch (error) {
    console.error("Error loading projects:", error);
    showErrorUI();
  }
}

let staticPreviews = {};

// Load static preview data
async function loadStaticPreviews() {
  try {
    const response = await fetch('preview.json');
    staticPreviews = response.ok ? await response.json() : {};
  } catch (error) {
    console.error("Couldn't load previews.json", error);
    staticPreviews = {};
  }
}

// Get preview with static data first, then try API
async function getPreview(url) {
  // Return static preview if available
  if (staticPreviews[url]) {
    return staticPreviews[url];
  }
  
  // Otherwise try the API
  try {
    const response = await fetch(API_URL + encodeURIComponent(url));
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      title: data.title || new URL(url).hostname,
      description: data.description || "No description available",
      image: data.image || FALLBACK_IMAGE,
      url: url
    };
  } catch (error) {
    console.error(`API failed for ${url}:`, error);
    throw error;
  }
}

async function loadSection(sectionId, projects) {
  const container = document.getElementById(`${sectionId}-container`);
  if (!container) return;

  // Load cards immediately with static/fallback data
  projects.forEach(project => {
    const preview = staticPreviews[project.url] || {
      title: project.fallback?.title || new URL(project.url).hostname,
      description: project.description || "Click to view content",
      image: project.fallback?.image || FALLBACK_IMAGE,
      url: project.url
    };
    createCard(preview, container);
  });

  // Refresh previews in background
  refreshPreviews(projects, container);
}

async function refreshPreviews(projects, container) {
  for (const project of projects) {
    try {
      const preview = await getPreview(project.url);
      updateCard(project.url, preview, container);
    } catch (error) {
      console.warn(`Couldn't refresh ${project.url}`, error);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadStaticPreviews();
  loadAllProjects();
});