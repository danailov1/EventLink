// assets/js/ui/renderEvents.js (with improved image handling)
import { getCategoryLabel, getCategoryIcon } from "../config/categories.js";

export function renderEvents(events = [], containerId, isRecommendations = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  if (!events.length) {
    container.innerHTML = '<p class="no-events">No events to show right now.</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const matchBadge = isRecommendations && event.matchScore > 0 
      ? `<div class="match-score">${event.matchScore.toFixed(1)} match</div>` 
      : '';
    
    const categoryIcon = getCategoryIcon(event.category);
    const categoryLabel = getCategoryLabel(event.category);
    
    const imageHtml = event.image 
      ? `<div class="image-container">
           <img src="${event.image}" alt="${event.title}">
           ${matchBadge}
         </div>`
      : `<div class="image-container" style="background: linear-gradient(135deg, ${getGradientForCategory(event.category)});">
           ${matchBadge}
         </div>`;
    
    card.innerHTML = `
      ${imageHtml}
      <div class="content">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <span class="category-tag">${categoryIcon} ${categoryLabel}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Helper function to get gradient colors based on category
function getGradientForCategory(categoryId) {
  const gradients = {
    music: '#A5B4FC, #818CF8',
    sports: '#6EE7B7, #34D399',
    technology: '#93C5FD, #60A5FA',
    art: '#F9A8D4, #F472B6',
    food: '#FDE68A, #FCD34D',
    education: '#C7D2FE, #A5B4FC',
    business: '#D1D5DB, #9CA3AF',
    health: '#86EFAC, #4ADE80',
    outdoor: '#99F6E4, #5EEAD4',
    entertainment: '#FCA5A5, #F87171',
    gaming: '#C4B5FD, #A78BFA',
    travel: '#7DD3FC, #38BDF8',
    science: '#A7F3D0, #6EE7B7',
    fashion: '#FBCFE8, #F9A8D4',
    photography: '#FED7AA, #FDBA74',
    volunteering: '#BBF7D0, #86EFAC'
  };
  
  return gradients[categoryId] || '#E2E8F0, #CBD5E1';
}