import { getCategoryLabel, getCategoryIcon } from "../config/categories.js";

// Format date for display
function formatEventDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format options
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  // Add relative time if event is soon
  if (diffDays === 0) {
    return `${formattedDate} • Today`;
  } else if (diffDays === 1) {
    return `${formattedDate} • Tomorrow`;
  } else if (diffDays > 0 && diffDays <= 7) {
    return `${formattedDate} • In ${diffDays} days`;
  } else if (diffDays < 0) {
    return `${formattedDate} • Past event`;
  }
  
  return formattedDate;
}

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
    card.dataset.eventId = event.id;

    const matchBadge = isRecommendations && event.matchScore > 0
      ? `<div class="match-score">${event.matchScore.toFixed(1)} match</div>`
      : '';

    const categoryIcon = getCategoryIcon(event.category);
    const categoryLabel = getCategoryLabel(event.category);
    const dateDisplay = event.eventDate ? `<div class="event-date"><i class="fas fa-calendar-alt"></i> ${formatEventDate(event.eventDate)}</div>` : '';

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
        ${dateDisplay}
        <span class="category-tag">${categoryIcon} ${categoryLabel}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openEventModal(event, isRecommendations);
      history.pushState({ eventId: event.id }, '', `/event/${event.id}`);
    });

    container.appendChild(card);
  });
}

// Open event in full-screen modal
export function openEventModal(event, isRecommendations = false) {
  const categoryIcon = getCategoryIcon(event.category);
  const categoryLabel = getCategoryLabel(event.category);
  const matchBadge = isRecommendations && event.matchScore > 0
    ? `<div class="modal-match-score">${categoryIcon} ${event.matchScore.toFixed(1)} match with your interests</div>`
    : '';

  const dateDisplay = event.eventDate 
    ? `<div class="modal-event-date">
         <i class="fas fa-calendar-alt"></i>
         <span>${formatEventDate(event.eventDate)}</span>
       </div>`
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
        ${dateDisplay}
        <div class="modal-description">
          <h3>About this event</h3>
          <p>${event.description}</p>
        </div>
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
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    modal.classList.add('active');
  });

  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
      if (history.state?.eventId) {
        history.back();
      }
    }, 300);
  };

  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Hype button
  const hypeBtn = modal.querySelector('.hype-btn');
  const hypeCount = modal.querySelector('.hype-count');
  const hypeText = modal.querySelector('.hype-text');
  const shareBtn = modal.querySelector('.modal-actions .secondary');

  if (hypeBtn) {
    hypeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
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

  // Share button
  if (shareBtn) {
    shareBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await shareEvent(event);
    });
  }
}

// Helper: get absolute event URL
function getEventUrl(eventId) {
  return `${window.location.origin}/event/${eventId}`;
}

// Share event with correct URL
async function shareEvent(event) {
  const categoryLabel = getCategoryLabel(event.category);
  const eventUrl = getEventUrl(event.id);
  const dateInfo = event.eventDate ? `\n📅 ${formatEventDate(event.eventDate)}` : '';

  const shareData = {
    title: `${event.title} - EventLink`,
    text: `Check out this ${categoryLabel} event: ${event.title}${dateInfo}\n\n${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}`,
    url: eventUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log('Event shared successfully');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        showShareModal(event, shareData);
      }
    }
  } else {
    showShareModal(event, shareData);
  }
}

// Custom share modal
function showShareModal(event, shareData) {
  const categoryLabel = getCategoryLabel(event.category);
  const eventUrl = encodeURIComponent(getEventUrl(event.id));
  const eventTitle = encodeURIComponent(event.title);
  const eventText = encodeURIComponent(shareData.text);

  const shareModal = document.createElement('div');
  shareModal.className = 'share-modal';
  shareModal.innerHTML = `
    <div class="share-overlay"></div>
    <div class="share-content">
      <button class="share-close" aria-label="Close share menu">
        <i class="fas fa-times"></i>
      </button>
      <h3>Share Event</h3>
      <p class="share-description">Share "${event.title}" with others</p>
      <div class="share-options">
        <a href="https://twitter.com/intent/tweet?text=${eventText}&url=${eventUrl}" target="_blank" rel="noopener noreferrer" class="share-option twitter">
          <i class="fab fa-twitter"></i><span>Twitter</span>
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${eventUrl}" target="_blank" rel="noopener noreferrer" class="share-option facebook">
          <i class="fab fa-facebook-f"></i><span>Facebook</span>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${eventUrl}" target="_blank" rel="noopener noreferrer" class="share-option linkedin">
          <i class="fab fa-linkedin-in"></i><span>LinkedIn</span>
        </a>
        <a href="https://wa.me/?text=${eventText}%20${eventUrl}" target="_blank" rel="noopener noreferrer" class="share-option whatsapp">
          <i class="fab fa-whatsapp"></i><span>WhatsApp</span>
        </a>
        <a href="mailto:?subject=${eventTitle}&body=${eventText}%0A%0A${eventUrl}" class="share-option email">
          <i class="fas fa-envelope"></i><span>Email</span>
        </a>
        <button class="share-option copy-link" data-url="${getEventUrl(event.id)}">
          <i class="fas fa-link"></i><span>Copy Link</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(shareModal);
  requestAnimationFrame(() => shareModal.classList.add('active'));

  const closeShareModal = () => {
    shareModal.classList.remove('active');
    setTimeout(() => document.body.removeChild(shareModal), 300);
  };

  shareModal.querySelector('.share-close').addEventListener('click', closeShareModal);
  shareModal.querySelector('.share-overlay').addEventListener('click', closeShareModal);

  const copyBtn = shareModal.querySelector('.copy-link');
  copyBtn.addEventListener('click', async () => {
    const url = copyBtn.dataset.url;
    try {
      await navigator.clipboard.writeText(url);
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please copy manually: ' + url);
    }
  });

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeShareModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Gradient helper
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