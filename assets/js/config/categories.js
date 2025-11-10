// Predefined categories for the entire application
export const CATEGORIES = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'art', label: 'Art & Design', icon: '🎨' },
  { id: 'food', label: 'Food & Drink', icon: '🍽️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'business', label: 'Business & Networking', icon: '💼' },
  { id: 'health', label: 'Health & Wellness', icon: '🧘' },
  { id: 'outdoor', label: 'Outdoor & Adventure', icon: '🏕️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮' },
  { id: 'travel', label: 'Travel & Tourism', icon: '✈️' },
  { id: 'science', label: 'Science & Innovation', icon: '🔬' },
  { id: 'fashion', label: 'Fashion & Beauty', icon: '👗' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'volunteering', label: 'Volunteering & Social', icon: '🤝' }
];

// Get category label by ID
export function getCategoryLabel(categoryId) {
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.label : categoryId;
}

// Get category icon by ID
export function getCategoryIcon(categoryId) {
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.icon : '📌';
}