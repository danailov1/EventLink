// assets/js/services/recommendationService.js - Enhanced with hype scoring
export function getRecommendedEvents(userInterests, events) {
  return events
    .map(event => {
      let score = 0;
      
      // 1. Exact category match: high score (5 points)
      if (userInterests.includes(event.category)) {
        score += 5;
      }
      
      // 2. Partial match: if event category is in user interests array
      userInterests.forEach(interest => {
        // Check if interest appears in description (bonus 0.5 points)
        if (event.description.toLowerCase().includes(interest.toLowerCase())) {
          score += 0.5;
        }
        // Check if interest appears in title (bonus 1 point)
        if (event.title.toLowerCase().includes(interest.toLowerCase())) {
          score += 1;
        }
      });
      
      // 3. Hype boost: Add popularity score
      // Each hype adds 0.3 points, capped at 3 points max
      const hypeCount = event.hypeCount || 0;
      const hypeBoost = Math.min(hypeCount * 0.3, 3);
      score += hypeBoost;
      
      return { 
        ...event, 
        matchScore: score,
        hypeBoost: hypeBoost 
      };
    })
    .filter(event => event.matchScore > 0) // Only show events with matches
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get trending events based on hype count
 * @param {Array} events - All events
 * @param {number} limit - Number of events to return
 * @returns {Array} - Sorted events by hype
 */
export function getTrendingEvents(events, limit = 10) {
  return events
    .filter(event => (event.hypeCount || 0) > 0)
    .sort((a, b) => (b.hypeCount || 0) - (a.hypeCount || 0))
    .slice(0, limit)
    .map(event => ({
      ...event,
      matchScore: event.hypeCount || 0
    }));
}

/**
 * Get recommended events with balanced scoring
 * Combines interest matching with community engagement
 * @param {Array} userInterests - User's interests
 * @param {Array} events - All events
 * @param {number} hypeWeight - Weight for hype (0-1), default 0.3
 * @returns {Array} - Recommended events
 */
export function getBalancedRecommendations(userInterests, events, hypeWeight = 0.3) {
  return events
    .map(event => {
      let interestScore = 0;
      
      // Calculate interest match score
      if (userInterests.includes(event.category)) {
        interestScore += 5;
      }
      
      userInterests.forEach(interest => {
        if (event.description.toLowerCase().includes(interest.toLowerCase())) {
          interestScore += 0.5;
        }
        if (event.title.toLowerCase().includes(interest.toLowerCase())) {
          interestScore += 1;
        }
      });
      
      // Calculate hype score (normalized)
      const hypeCount = event.hypeCount || 0;
      const hypeScore = Math.min(hypeCount * 0.5, 5); // Max 5 points from hype
      
      // Combine scores with weighting
      const finalScore = (interestScore * (1 - hypeWeight)) + (hypeScore * hypeWeight);
      
      return { 
        ...event, 
        matchScore: finalScore,
        interestScore: interestScore,
        hypeScore: hypeScore
      };
    })
    .filter(event => event.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}