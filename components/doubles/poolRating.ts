/** PDGA-comparable number for pool ordering (league convention). */
export function comparablePdgaRating(rating: number, ratingType: "PDGA" | "UDisc" | "Other"): number {
  if (ratingType === "UDisc") return rating * 2 + 500;
  return rating;
}
