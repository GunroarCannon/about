const API_URL = "https://your-api-name.onrender.com/preview?url=";

async function loadProjects() {
  const response = await fetch('projects.json');
  const data = await response.json();

  // Load games
  for (const project of data.games) {
    const preview = await fetchPreview(project.url);
    renderCard(preview, 'games-container');
  }

  // Load websites
  for (const project of data.websites) {
    const preview = await fetchPreview(project.url);
    renderCard(preview, 'websites-container');
  }
}

async function fetchPreview(url) {
  const response = await fetch(API_URL + encodeURIComponent(url));
  return await response.json();
}

function renderCard(preview, containerId) {
  const container = document.getElementById(containerId);
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${preview.image || 'placeholder.jpg'}" alt="${preview.title}">
    <h3>${preview.title}</h3>
    <p>${preview.description || 'No description available.'}</p>
    <a href="${preview.url}" target="_blank">Visit →</a>
  `;
  container.appendChild(card);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProjects);