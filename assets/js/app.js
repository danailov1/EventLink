// assets/js/app.js (with category filter population)
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "/assets/js/config/firebaseConfig.js";
import { renderNavbar } from "/assets/js/ui/navbar.js";
import { handleRegisterForm, handleLoginForm, handleUpdateProfileForm, handleCreateEventForm } from "/assets/js/ui/formHandlers.js";
import { renderEvents } from "/assets/js/ui/renderEvents.js";
import { renderProfile } from "/assets/js/ui/renderProfile.js";
import { getAllEvents } from "/assets/js/services/eventService.js";
import { getUserProfile } from "/assets/js/services/userService.js";
import { getRecommendedEvents } from "/assets/js/services/recommendationService.js";
import { CATEGORIES, getCategoryLabel } from "/assets/js/config/categories.js";

async function initApp() {
  renderNavbar();

  // Page-specific handlers
  handleRegisterForm();
  handleLoginForm();

  onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;
    const isHome = path === '/' || path.endsWith('index.html');
    const inPages = path.includes('/pages/');

    // Protected page guard
    const protectedPages = ['profile.html', 'events.html', 'recommendations.html'];
    if (!user && protectedPages.some(p => path.includes(p))) {
      window.location.href = inPages ? 'login.html' : 'pages/login.html';
      return;
    }

    try {
      if (isHome) {
        const main = document.querySelector('main');
        main.innerHTML = '<div class="loader">Loading events...</div>';
        const events = await getAllEvents() || [];

        if (user) {
          const profile = await getUserProfile(user.uid) || { interests: [] };
          const recs = getRecommendedEvents(profile.interests, events).slice(0, 6);
          main.innerHTML = `
            <h1>Welcome back!</h1>
            <p>Here are events tailored to your interests:</p>
            <div id="home-recommendations"></div>
            <div class="home-links">
              <a href="${inPages ? 'recommendations.html' : 'pages/recommendations.html'}" class="btn primary">View All Recommendations</a>
              <a href="${inPages ? 'events.html' : 'pages/events.html'}" class="btn secondary">Browse All Events</a>
            </div>
          `;
          renderEvents(recs.length ? recs : events.slice(0, 6), 'home-recommendations', true);
          if (!recs.length && profile.interests.length === 0) {
            document.getElementById('home-recommendations').innerHTML += '<p class="no-events">Add interests in your profile for better recommendations!</p>';
          }
        } else {
          const featured = events.length ? events.slice(-3).reverse() : [];
          main.innerHTML = `
            <div class="hero">
              <h1>EventLink</h1>
              <p>Discover events you'll love—personalized just for you.</p>
              <div class="cta-buttons">
                <a href="pages/register.html" class="btn primary">Get Started</a>
                <a href="pages/login.html" class="btn secondary">Log In</a>
              </div>
            </div>
            <h2>Featured Events</h2>
            <div id="featured-events"></div>
          `;
          renderEvents(featured, 'featured-events');
          if (!featured.length) {
            document.getElementById('featured-events').innerHTML = '<p class="no-events">No events yet—create the first one!</p>';
          }
        }
      } else if (path.includes('profile.html') && user) {
        const container = document.getElementById('profile-info');
        container.innerHTML = '<p class="loader">Loading profile...</p>';
        const profile = await getUserProfile(user.uid);
        if (profile) {
          renderProfile(profile, 'profile-info');
          handleUpdateProfileForm(user.uid);
        } else {
          container.innerHTML = '<p class="error-message">Profile not found.</p>';
        }
      } else if (path.includes('events.html') && user) {
        const list = document.getElementById('events-list');
        list.innerHTML = '<p class="loader">Loading events...</p>';
        const events = await getAllEvents() || [];
        let displayed = events;

        // Filters setup
        const searchInput = document.getElementById('event-search');
        const catSelect = document.getElementById('category-filter');
        const clearBtn = document.getElementById('clear-filters');

        // Populate category filter with predefined categories
        CATEGORIES.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = `${cat.icon} ${cat.label}`;
          catSelect.appendChild(opt);
        });

        const applyFilters = () => {
          let temp = events;
          const term = searchInput.value.toLowerCase();
          if (term) {
            temp = temp.filter(e => {
              const categoryLabel = getCategoryLabel(e.category).toLowerCase();
              return e.title.toLowerCase().includes(term) || 
                     e.description.toLowerCase().includes(term) || 
                     categoryLabel.includes(term);
            });
          }
          if (catSelect.value) {
            temp = temp.filter(e => e.category === catSelect.value);
          }
          displayed = temp;
          renderEvents(displayed, 'events-list');
          if (!displayed.length) {
            list.innerHTML = '<p class="no-events">No events match your filters—try broadening your search.</p>';
          }
        };

        searchInput.addEventListener('input', applyFilters);
        catSelect.addEventListener('change', applyFilters);
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          catSelect.value = '';
          applyFilters();
        });

        renderEvents(displayed, 'events-list');
        handleCreateEventForm(user.uid);
      } else if (path.includes('recommendations.html') && user) {
        const list = document.getElementById('recommendations-list');
        list.innerHTML = '<p class="loader">Loading recommendations...</p>';
        const profile = await getUserProfile(user.uid);
        if (profile && profile.interests && profile.interests.length) {
          const events = await getAllEvents() || [];
          let recs = getRecommendedEvents(profile.interests, events);
          let displayed = recs;

          const searchInput = document.getElementById('rec-search');
          if (searchInput) {
            searchInput.addEventListener('input', () => {
              const term = searchInput.value.toLowerCase();
              displayed = recs.filter(e => {
                const categoryLabel = getCategoryLabel(e.category).toLowerCase();
                return e.title.toLowerCase().includes(term) || 
                       e.description.toLowerCase().includes(term) ||
                       categoryLabel.includes(term);
              });
              renderEvents(displayed, 'recommendations-list', true);
              if (!displayed.length) {
                list.innerHTML = '<p class="no-events">No matches in your recommendations.</p>';
              }
            });
          }

          renderEvents(displayed, 'recommendations-list', true);
          if (!displayed.length) {
            list.innerHTML = '<p class="no-events">No strong matches yet—explore all events or update interests.</p>';
          }
        } else {
          document.getElementById('error-message').textContent = 'Add interests to your profile for personalized recommendations!';
        }
      }
    } catch (err) {
      console.error(err);
      document.getElementById('error-message')?.classList.add('error-message');
      document.getElementById('error-message').textContent = 'Something went wrong—please try again.';
    }
  });
}

document.addEventListener("DOMContentLoaded", initApp);