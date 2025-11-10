//filters.js

// Placeholder for event filters, e.g., by category
export function filterEventsByCategory(events, category) {
  return events.filter(event => event.category.toLowerCase() === category.toLowerCase());
}

// Add more filters as needed