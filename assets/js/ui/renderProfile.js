// assets/js/ui/renderProfile.js (with improved formatting)
import { getCategoryLabel, getCategoryIcon } from "../config/categories.js";

export function renderProfile(profile, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !profile) {
    if (container) container.innerHTML = '<p class="no-events">Profile not available.</p>';
    return;
  }

  const interestsHtml = profile.interests?.length 
    ? profile.interests.map(i => {
        const icon = getCategoryIcon(i);
        const label = getCategoryLabel(i);
        return `<span class="tag">${icon} ${label}</span>`;
      }).join('')
    : '<span class="tag" style="opacity: 0.6;">No interests selected</span>';

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-container">
        <img src="${profile.avatar || '../assets/img/default-avatar.png'}" alt="Your avatar" class="avatar">
      </div>
      <div class="profile-details">
        <h2>${profile.email.split('@')[0]}</h2>
        <p class="profile-email">${profile.email}</p>
        <div class="interests-section">
          <strong>Your Interests:</strong>
          <div class="interests">
            ${interestsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}