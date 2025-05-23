/*async function generatePreviewsJson() {
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
*/