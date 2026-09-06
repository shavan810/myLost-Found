// Intelligent matching algorithm
export const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;
  const reasons = [];

  // Category match (25 points)
  if (lostItem.category === foundItem.category) {
    score += 25;
    reasons.push(`Same category: ${lostItem.category}`);
  }

  // Title/description similarity (30 points)
  const titleSim = textSimilarity(lostItem.title.toLowerCase(), foundItem.title.toLowerCase());
  const descSim = textSimilarity(lostItem.description.toLowerCase(), foundItem.description.toLowerCase());
  const textScore = Math.round((titleSim * 0.4 + descSim * 0.6) * 30);
  if (textScore > 5) {
    score += textScore;
    reasons.push(`Description similarity: ${Math.round((titleSim * 0.4 + descSim * 0.6) * 100)}%`);
  }

  // Location match (20 points)
  if (lostItem.location?.city && foundItem.location?.city) {
    if (lostItem.location.city.toLowerCase() === foundItem.location.city.toLowerCase()) {
      score += 20;
      reasons.push(`Same city: ${lostItem.location.city}`);
    } else if (lostItem.location.state?.toLowerCase() === foundItem.location.state?.toLowerCase()) {
      score += 8;
      reasons.push(`Same state`);
    }
  }

  // Date proximity (15 points)
  const lostDate = new Date(lostItem.date);
  const foundDate = new Date(foundItem.date);
  const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 1) { score += 15; reasons.push('Found within 1 day of loss'); }
  else if (daysDiff <= 3) { score += 12; reasons.push('Found within 3 days'); }
  else if (daysDiff <= 7) { score += 8; reasons.push('Found within a week'); }
  else if (daysDiff <= 30) { score += 4; reasons.push('Found within a month'); }

  // Color match (5 points)
  if (lostItem.color && foundItem.color &&
      lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) {
    score += 5;
    reasons.push(`Color match: ${lostItem.color}`);
  }

  // Brand match (5 points)
  if (lostItem.brand && foundItem.brand &&
      lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
    score += 5;
    reasons.push(`Brand match: ${lostItem.brand}`);
  }

  return { score: Math.min(score, 100), reasons };
};

const textSimilarity = (str1, str2) => {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = [...words1].filter(w => words2.has(w));
  return intersection.length / Math.sqrt(words1.size * words2.size);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
