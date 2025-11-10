// recommendationService.js - Enhanced algorithm with exact category matching
export function getRecommendedEvents(userInterests, events) {
  return events
    .map(event => {
      let score = 0;
      
      // Exact category match: high score (5 points)
      if (userInterests.includes(event.category)) {
        score += 5;
      }
      
      // Partial match: if event category is in user interests array
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
      
      return { ...event, matchScore: score };
    })
    .filter(event => event.matchScore > 0) // Only show events with matches
    .sort((a, b) => b.matchScore - a.matchScore);
}