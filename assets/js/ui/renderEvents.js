// assets/js/ui/renderEvents.js (with modal support)
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
    
    // Add click handler to open modal
    card.addEventListener('click', () => openEventModal(event, isRecommendations));
    
    container.appendChild(card);
  });
}

// Open event in full-screen modal
function openEventModal(event, isRecommendations = false) {
  const categoryIcon = getCategoryIcon(event.category);
  const categoryLabel = getCategoryLabel(event.category);
  
  const matchBadge = isRecommendations && event.matchScore > 0 
    ? `<div class="modal-match-score">${categoryIcon} ${event.matchScore.toFixed(1)} match with your interests</div>` 
    : '';
  
  const imageHtml = event.image 
    ? `<div class="modal-image-container">
         <img src="${event.image}" alt="${event.title}">
       </div>`
    : `<div class="modal-image-container" style="background: linear-gradient(135deg, ${getGradientForCategory(event.category)});">
         <div class="modal-placeholder-icon">${categoryIcon}</div>
       </div>`;
  
  const modal = document.createElement('div');
  modal.className = 'event-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">
        <i class="fas fa-times"></i>
      </button>
      ${imageHtml}
      <div class="modal-body">
        ${matchBadge}
        <h2>${event.title}</h2>
        <div class="modal-category">
          <span class="category-tag">${categoryIcon} ${categoryLabel}</span>
        </div>
        <div class="modal-description">
          <h3>About this event</h3>
          <p>${event.description}</p>
        </div>
        
        <!-- Event Actions -->
        <div class="modal-actions">
          <button class="btn hype-btn" data-event-id="${event.id}">
            <i class="fas fa-fire"></i>
            <span class="hype-text">Hype Up</span>
            <span class="hype-count">${event.hypeCount || 0}</span>
          </button>
          <button class="btn secondary">
            <i class="fas fa-share-alt"></i>
            Share
          </button>
        </div>
        
        <div class="modal-footer">
          <p class="modal-note">More features coming soon: RSVP, comments, and event details!</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
  
  // Trigger animation
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  
  // Close modal handlers
  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    }, 300);
  };
  
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Hype Up button handler
  const hypeBtn = modal.querySelector('.hype-btn');
  const hypeCount = modal.querySelector('.hype-count');
  const hypeText = modal.querySelector('.hype-text');
  const shareBtn = modal.querySelector('.modal-actions .secondary');
  
  if (hypeBtn) {
    hypeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      // Import functions dynamically
      const { toggleHypeEvent, checkIfUserHyped } = await import('../services/eventService.js');
      const { auth } = await import('../config/firebaseConfig.js');
      
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to hype up events!');
        return;
      }
      
      try {
        hypeBtn.disabled = true;
        const result = await toggleHypeEvent(event.id, user.uid);
        
        // Update UI
        hypeCount.textContent = result.newCount;
        
        if (result.hyped) {
          hypeBtn.classList.add('hyped');
          hypeText.textContent = 'Hyped!';
        } else {
          hypeBtn.classList.remove('hyped');
          hypeText.textContent = 'Hype Up';
        }
        
        hypeBtn.disabled = false;
      } catch (error) {
        console.error('Error hyping event:', error);
        alert('Failed to hype event. Please try again.');
        hypeBtn.disabled = false;
      }
    });
    
    // Check if user already hyped this event
    (async () => {
      const { checkIfUserHyped } = await import('../services/eventService.js');
      const { auth } = await import('../config/firebaseConfig.js');
      
      const user = auth.currentUser;
      if (user) {
        const hasHyped = await checkIfUserHyped(event.id, user.uid);
        if (hasHyped) {
          hypeBtn.classList.add('hyped');
          hypeText.textContent = 'Hyped!';
        }
      }
    })();
  }
  
  // Share button handler
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      alert('Share feature coming soon!');
    });
  }
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