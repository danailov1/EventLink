// assets/js/ui/navbar.js (responsive + dynamic paths + icons)
import { auth } from "/assets/js/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { logoutUser } from "/assets/js/services/authService.js";

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const inPages = window.location.pathname.includes('/pages/');

  const links = {
    home: inPages ? '../index.html' : 'index.html',
    events: inPages ? 'events.html' : 'pages/events.html',
    recommendations: inPages ? 'recommendations.html' : 'pages/recommendations.html',
    profile: inPages ? 'profile.html' : 'pages/profile.html',
    login: inPages ? 'login.html' : 'pages/login.html',
    register: inPages ? 'register.html' : 'pages/register.html'
  };

  const update = (user) => {
    navbar.innerHTML = `
      <div class="navbar-container">
        <a href="${links.home}" class="logo"><i class="fas fa-link"></i> EventLink</a>
        <input type="checkbox" id="nav-toggle" class="nav-toggle">
        <label for="nav-toggle" class="hamburger"><i class="fas fa-bars"></i></label>
        <ul class="navbar-menu">
          <li><a href="${links.home}"><i class="fas fa-home"></i> Home</a></li>
          <li><a href="${links.events}"><i class="fas fa-calendar-alt"></i> Events</a></li>
          <li><a href="${links.recommendations}"><i class="fas fa-thumbs-up"></i> Recommendations</a></li>
          ${user ? `
            <li><a href="${links.profile}"><i class="fas fa-user-circle"></i> Profile</a></li>
            <li><button id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button></li>
          ` : `
            <li><a href="${links.login}"><i class="fas fa-sign-in-alt"></i> Login</a></li>
            <li><a href="${links.register}"><i class="fas fa-user-plus"></i> Register</a></li>
          `}
        </ul>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = links.home;
      });
    }
  };

  update(null); // Skeleton
  onAuthStateChanged(auth, update);
}