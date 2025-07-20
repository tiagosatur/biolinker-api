interface SearchCounts {
  username: number;
  displayName: number;
}

interface SearchLimits {
  username: number;
  displayName: number;
  total: number;
}

/**
 * Calculates the optimal distribution of search limits between username and displayName searches
 * based on the number of matches found for each field.
 * 
 * @param counts - The number of matches found for username and displayName
 * @param totalLimit - The total number of results requested
 * @returns Object containing the calculated limits for each field and total matches
 * 
 * @example
 * // With 2 username matches and 6 displayName matches, requesting 10 results
 * const limits = calculateSearchLimits({ username: 2, displayName: 6 }, 10);
 * // Returns { username: 2, displayName: 8, total: 8 }
 * 
 * @example
 * // With 20 username matches and 20 displayName matches, requesting 10 results
 * const limits = calculateSearchLimits({ username: 20, displayName: 20 }, 10);
 * // Returns { username: 5, displayName: 5, total: 40 }
 */
export function calculateSearchLimits(counts: SearchCounts, totalLimit: number): SearchLimits {
  const total = counts.username + counts.displayName;
  
  // If no results, return zero limits
  if (total === 0) {
    return {
      username: 0,
      displayName: 0,
      total: 0
    };
  }

  // Calculate how many results we actually need
  const totalNeeded = Math.min(totalLimit, total);

  // Calculate initial proportional distribution
  let usernameLimit = Math.floor((counts.username / total) * totalNeeded);
  let displayNameLimit = totalNeeded - usernameLimit;

  // Adjust limits if one search has fewer results than its allocation
  if (usernameLimit > counts.username) {
    const excess = usernameLimit - counts.username;
    usernameLimit = counts.username;
    displayNameLimit += excess;
  } else if (displayNameLimit > counts.displayName) {
    const excess = displayNameLimit - counts.displayName;
    displayNameLimit = counts.displayName;
    usernameLimit += excess;
  }

  return {
    username: usernameLimit,
    displayName: displayNameLimit,
    total
  };
} 