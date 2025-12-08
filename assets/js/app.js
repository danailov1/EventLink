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

  await maybeOpenEventFromUrl();
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

            <!-- Features Section -->
            <section class="features">
              <h2>What is EventLink?</h2>
              <div class="features-grid">
                <div class="feature-card">
<i class="material-icons feature-icon">gps_fixed</i>
                  <h3>Personalized Events</h3>
                  <p>Get event recommendations tailored to your interests. The more you tell us about yourself, the better our suggestions become.</p>
                </div>
                <div class="feature-card">
                  <i class="material-icons feature-icon">search</i>
                  <h3>Smart Discovery</h3>
                  <p>Browse and search through events by category, location, and interests. Find exactly what you're looking for or discover something new.</p>
                </div>
                <div class="feature-card">
                  <i class="material-icons feature-icon">group</i>
                  <h3>Community Events</h3>
                  <p>Connect with others who share your passions. From concerts and conferences to meetups and workshops—find your people.</p>
                </div>
              </div>
            </section>

            <!-- How It Works Section -->
            <section class="how-it-works">
              <h2>How It Works</h2>
              <div class="steps-container">
                <div class="step">
                  <div class="step-number">1</div>
                  <h3>Create Your Account</h3>
                  <p>Sign up in seconds with just your email. Set up your profile and tell us about your interests.</p>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <h3>Discover Events</h3>
                  <p>Browse events curated for your interests or search for specific types of events you love.</p>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <h3>Get Recommendations</h3>
                  <p>Our AI-powered recommendation engine suggests events that match your preferences perfectly.</p>
                </div>
                <div class="step">
                  <div class="step-number">4</div>
                  <h3>Share & Connect</h3>
                  <p>Create events, invite friends, and build your community. Share your passions with others!</p>
                </div>
              </div>
            </section>

            <!-- Why Choose EventLink Section -->
            <section class="why-choose">
              <h2>Why Choose EventLink?</h2>
              <div class="benefits-list">
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">flash_on</i>
                  <div class="benefit-content">
                    <h3>Smart Recommendations</h3>
                    <p>Our algorithm learns your preferences to suggest events you'll actually enjoy.</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">palette</i>
                  <div class="benefit-content">
                    <h3>Beautiful & Intuitive</h3>
                    <p>A sleek, modern interface that makes discovering events fun and easy.</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">lock</i>
                  <div class="benefit-content">
                    <h3>Your Privacy Matters</h3>
                    <p>We respect your data and never share your information without permission.</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">smartphone</i>
                  <div class="benefit-content">
                    <h3>Mobile Friendly</h3>
                    <p>Browse events on the go. EventLink works seamlessly on all devices.</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">star</i>
                  <div class="benefit-content">
                    <h3>Create & Share</h3>
                    <p>Organize your own events and build communities around shared interests.</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <i class="material-icons benefit-icon">rocket_launch</i>
                  <div class="benefit-content">
                    <h3>Always Free</h3>
                    <p>Access all core features at no cost. Create and discover without limits.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Featured Events Section -->
            <section class="featured-section">
              <h2>Featured Events</h2>
              <div id="featured-events"></div>
            </section>

            <!-- Final CTA Section -->
            <section class="cta-section">
              <h2>Ready to Find Your Next Event?</h2>
              <p>Join thousands of people discovering events they love. Sign up today and get personalized recommendations.</p>
              <div class="cta-buttons-large">
                <a href="pages/register.html" class="btn primary">Create Free Account</a>
                <a href="pages/login.html" class="btn secondary">Already Have an Account? Log In</a>
              </div>
            </section>
          `;
          renderEvents(featured, 'featured-events');
          if (!featured.length) {
            document.getElementById('featured-events').innerHTML = '<p class="no-events">No events yet—check back soon or create the first one!</p>';
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

async function maybeOpenEventFromUrl() {
  const match = location.pathname.match(/^\/event\/([a-zA-Z0-9]+)$/);
  if (!match) return;

  const eventId = match[1];

  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    const { db } = await import("/assets/js/config/firebaseConfig.js");
    const snap = await getDoc(doc(db, "events", eventId));

    if (!snap.exists()) {
      alert("Event not found.");
      history.replaceState(null, "", "/");
      return;
    }

    const event = { id: snap.id, ...snap.data() };

    // Create a temporary container just for this modal
    const container = document.createElement("div");
    container.id = "url-event-container";
    document.body.appendChild(container);

    // Render single event → card click opens modal
    const { renderEvents } = await import("/assets/js/ui/renderEvents.js");
    renderEvents([event], "url-event-container");

    // Auto-click the card to open modal
    requestAnimationFrame(() => {
      const card = container.querySelector('.event-card');
      card?.click();
    });

    // Optional: clean up container when modal closes
    window.addEventListener('popstate', () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, { once: true });

  } catch (err) {
    console.error("Failed to load event from URL:", err);
    alert("Could not load event.");
    history.replaceState(null, "", "/");
  }
}

document.addEventListener("DOMContentLoaded", initApp);