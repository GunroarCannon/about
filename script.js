const API_URL = "https://link-previewer-efsv.onrender.com/preview?url=";
const FALLBACK_IMAGE = "fallback.jpg";
async function generatePreviewsJson() {
  const API_URL = "https://link-previewer-efsv.onrender.com/preview?url=";
  const FALLBACK_IMAGE = "fallback.jpg";
  
  // Load your projects data
  const projectsResponse = await fetch('projects.json');
  const projectsData = await projectsResponse.json();
  
  // Collect all unique URLs
  const allUrls = [
    ...projectsData.games.map(p => p.url),
    ...projectsData.websites.map(p => p.url),
    ...projectsData.art.map(p => p.url)
  ];
  
  const previewsData = {};
  
  // Fetch preview for each URL
  for (const url of allUrls) {
    try {
      console.log(`Fetching preview for: ${url}`);
      const response = await fetch(API_URL + encodeURIComponent(url));
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      previewsData[url] = {
        title: data.title || new URL(url).hostname,
        description: data.description || "No description available",
        image: data.image || FALLBACK_IMAGE,
        url: url
      };
      
      console.log(`Success: ${url}`);
    } catch (error) {
      console.error(`Failed for ${url}:`, error);
      // Use fallback data if API fails
      const project = [...projectsData.games, ...projectsData.websites, ...projectsData.art]
        .find(p => p.url === url);
      
      previewsData[url] = {
        title: project?.fallback?.title || new URL(url).hostname,
        description: project?.description || "Click to view content",
        image: project?.fallback?.image || FALLBACK_IMAGE,
        url: url
      };
    }
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Format the JSON nicely and copy to clipboard
  const jsonString = JSON.stringify(previewsData, null, 2);
  console.log(jsonString);
  
  // Copy to clipboard (works in most modern browsers)
  navigator.clipboard.writeText(jsonString).then(() => {
    console.log('JSON copied to clipboard! Paste it into previews.json');
  }).catch(err => {
    console.error('Could not copy text: ', err);
    console.log('Manually copy the JSON output above');
  });
  
  return previewsData;
}

// Run the generator
generatePreviewsJson();
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