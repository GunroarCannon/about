const API_URL = "https://link-previewer-efsv.onrender.com/preview?url=";
const FALLBACK_IMAGE = "fallback.jpg";

async function loadAllProjects() {
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error("Failed to load projects.json");
    const projectData = await response.json();

    await loadSection('games', projectData.games);
    await loadSection('websites', projectData.websites);
    await loadSection('art', projectData.art);
    
  } catch (error) {
    console.error("Error loading projects:", error);
    showErrorUI();
  }
}

async function loadSection(sectionId, projects) {
  const container = document.getElementById(`${sectionId}-container`);
  if (!container) return;

  for (const project of projects) {
    try {
      let preview;
      
      /// Try API first
      try {
        preview = await fetchPreview(project.url);
      } catch (apiError) {
        console.warn(`API failed for ${project.url}:`, apiError);
        preview = {
          title: project.fallback?.title || new URL(project.url).hostname,
          description: project.description || "Click to view content",
          image: project.fallback?.imagee || FALLBACK_IMAGE,
          url: project.url
        };
      }

      createCard(preview, container);

    } catch (error) {
      console.error(`Error processing ${project.url}:`, error);
      createCard({
        title: "Project Preview",
        description: "Couldn't load this item",
        image: FALLBACK_IMAGE,
        url: project.url
      }, container);
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