// assets/js/ui/formHandlers.js (with date field)
import { registerUser, loginUser, logoutUser } from "/assets/js/services/authService.js";
import { createUserProfile, updateUserProfile, getUserProfile } from "/assets/js/services/userService.js";
import { createEvent } from "/assets/js/services/eventService.js";
import { imageToBase64 } from "../utilis/base64.js";
import { CATEGORIES } from "../config/categories.js";

// Render interest checkboxes
function renderInterestCheckboxes(containerId, selectedInterests = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  CATEGORIES.forEach(category => {
    const isChecked = selectedInterests.includes(category.id);
    const checkbox = document.createElement('label');
    checkbox.className = 'checkbox-item';
    checkbox.innerHTML = `
      <input type="checkbox" name="interests" value="${category.id}" ${isChecked ? 'checked' : ''}>
      <span class="checkbox-label">
        <span class="category-icon">${category.icon}</span>
        ${category.label}
      </span>
    `;
    container.appendChild(checkbox);
  });
}

// Render category dropdown
function renderCategorySelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.label}`;
    select.appendChild(option);
  });
}

export function handleRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  renderInterestCheckboxes('interests-checkboxes');

  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');

  const validatePasswords = () => {
    if (passwordInput.value !== confirmInput.value) {
      confirmInput.setCustomValidity('Passwords do not match');
    } else {
      confirmInput.setCustomValidity('');
    }
  };

  passwordInput.addEventListener('change', validatePasswords);
  confirmInput.addEventListener('keyup', validatePasswords);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    const checkboxes = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(checkboxes).map(cb => cb.value);

    if (interests.length === 0) {
      document.getElementById('error-message').textContent = 'Please select at least one interest';
      return;
    }

    try {
      const { user } = await registerUser(email, password, confirmPassword);
      await createUserProfile(user.uid, { email, interests, avatar: null });
      window.location.href = 'profile.html';
    } catch (error) {
      document.getElementById('error-message').textContent = error.message;
    }
  });
}

export function handleUpdateProfileForm(uid) {
  const form = document.getElementById('update-profile-form');
  if (!form || !uid) return;
  form.style.display = 'block';

  getUserProfile(uid).then(profile => {
    renderInterestCheckboxes('interests-checkboxes', profile?.interests || []);
  });

  const avatarInput = document.getElementById('avatar');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const base64 = await imageToBase64(file);
        const avatarImg = document.querySelector('#profile-info .avatar');
        if (avatarImg) {
          avatarImg.src = base64;
        }
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const avatarFile = avatarInput.files[0];
    
    const checkboxes = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(checkboxes).map(cb => cb.value);

    if (interests.length === 0) {
      document.getElementById('error-message').textContent = 'Please select at least one interest';
      return;
    }

    try {
      await updateUserProfile(uid, { interests, avatarFile });
      location.reload();
    } catch (error) {
      document.getElementById('error-message').textContent = error.message;
    }
  });
}

export function handleCreateEventForm(uid) {
  const form = document.getElementById('create-event-form');
  if (!form || !uid) return;
  form.style.display = 'block';

  renderCategorySelect('category');

  const imageInput = document.getElementById('image');
  const preview = document.getElementById('image-preview');
  
  if (imageInput && preview) {
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const base64 = await imageToBase64(file);
        preview.classList.add('has-image');
        preview.innerHTML = `<img src="${base64}" alt="Preview">`;
      } else {
        preview.classList.remove('has-image');
        preview.innerHTML = '';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const eventDate = document.getElementById('event-date').value;
    const imageFile = imageInput.files[0];
    
    if (!category) {
      document.getElementById('error-message').textContent = 'Please select a category';
      return;
    }

    if (!eventDate) {
      document.getElementById('error-message').textContent = 'Please select an event date';
      return;
    }

    try {
      await createEvent({ 
        title, 
        description, 
        category, 
        eventDate, 
        imageFile, 
        creator: uid 
      });
      location.reload();
    } catch (error) {
      document.getElementById('error-message').textContent = error.message;
    }
  });
}

export function handleLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await loginUser(email, password);
      window.location.href = '../pages/profile.html';
    } catch (error) {
      document.getElementById('error-message').textContent = error.message;
    }
  });
}

export function handleLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      window.location.href = '../index.html';
    });
  }
}