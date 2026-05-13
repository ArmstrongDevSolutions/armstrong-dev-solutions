/**
 * PDGA round rating vs one-round stroke totals, for estimating a PDGA-like number
 * when a player uses Rating type "Other" + local course + relative score.
 *
 * Source: user-collected tournament results (round ratings, not player overall rating).
 */

export type CourseRatingTableId = "brownDeer" | "estabrook" | "dretzka";

export type StrokeRoundRatingPoint = {
  strokes: number;
  /** Mean PDGA round rating for this stroke total in the sample. */
  roundRating: number;
  sampleCount: number;
};

export type CourseRatingTable = {
  id: CourseRatingTableId;
  displayName: string;
  par: number;
  /** Sorted ascending by strokes. */
  points: readonly StrokeRoundRatingPoint[];
};

/** Brown Deer — par 66; duplicate score/rating rows in source averaged per stroke. */
export const brownDeerRatingTable: CourseRatingTable = {
  id: "brownDeer",
  displayName: "Brown Deer",
  par: 66,
  points: [
    { strokes: 56, roundRating: 1041, sampleCount: 1 },
    { strokes: 57, roundRating: 1033, sampleCount: 1 },
    { strokes: 59, roundRating: 1016, sampleCount: 3 },
    { strokes: 60, roundRating: 1008, sampleCount: 3 },
    { strokes: 61, roundRating: 1000, sampleCount: 1 },
    { strokes: 62, roundRating: 992, sampleCount: 3 },
    { strokes: 63, roundRating: 984, sampleCount: 3 },
    { strokes: 64, roundRating: 975, sampleCount: 4 },
    { strokes: 65, roundRating: 967, sampleCount: 14 },
    { strokes: 66, roundRating: 959, sampleCount: 5 },
    { strokes: 67, roundRating: 951, sampleCount: 8 },
    { strokes: 68, roundRating: 943, sampleCount: 6 },
    { strokes: 69, roundRating: 934, sampleCount: 5 },
    { strokes: 70, roundRating: 926, sampleCount: 11 },
    { strokes: 71, roundRating: 918, sampleCount: 6 },
    { strokes: 72, roundRating: 910, sampleCount: 7 },
    { strokes: 73, roundRating: 902, sampleCount: 8 },
    { strokes: 74, roundRating: 893, sampleCount: 6 },
    { strokes: 75, roundRating: 885, sampleCount: 7 },
    { strokes: 76, roundRating: 877, sampleCount: 3 },
    { strokes: 77, roundRating: 869, sampleCount: 4 },
    { strokes: 78, roundRating: 861, sampleCount: 3 },
    { strokes: 79, roundRating: 852, sampleCount: 5 },
    { strokes: 81, roundRating: 836, sampleCount: 3 },
    { strokes: 82, roundRating: 828, sampleCount: 3 },
    { strokes: 83, roundRating: 819, sampleCount: 1 },
    { strokes: 85, roundRating: 803, sampleCount: 1 },
    { strokes: 90, roundRating: 762, sampleCount: 1 },
    { strokes: 95, roundRating: 721, sampleCount: 2 },
  ],
};

/**
 * Estabrook — par 60; when the same stroke total had different PDGA round ratings,
 * values were averaged (reflects different SSA/fields for the same score).
 */
export const estabrookRatingTable: CourseRatingTable = {
  id: "estabrook",
  displayName: "Estabrook",
  par: 60,
  points: [
    { strokes: 47, roundRating: 1042, sampleCount: 1 },
    { strokes: 48, roundRating: 1020, sampleCount: 4 },
    { strokes: 49, roundRating: 1004, sampleCount: 1 },
    { strokes: 50, roundRating: 1004, sampleCount: 6 },
    { strokes: 51, roundRating: 990, sampleCount: 2 },
    { strokes: 52, roundRating: 982, sampleCount: 10 },
    { strokes: 53, roundRating: 968, sampleCount: 7 },
    { strokes: 54, roundRating: 962, sampleCount: 8 },
    { strokes: 55, roundRating: 950, sampleCount: 14 },
    { strokes: 56, roundRating: 940, sampleCount: 18 },
    { strokes: 57, roundRating: 927, sampleCount: 16 },
    { strokes: 58, roundRating: 919, sampleCount: 20 },
    { strokes: 59, roundRating: 908, sampleCount: 13 },
    { strokes: 60, roundRating: 898, sampleCount: 11 },
    { strokes: 61, roundRating: 887, sampleCount: 10 },
    { strokes: 62, roundRating: 875, sampleCount: 11 },
    { strokes: 63, roundRating: 862, sampleCount: 11 },
    { strokes: 64, roundRating: 853, sampleCount: 16 },
    { strokes: 65, roundRating: 842, sampleCount: 4 },
    { strokes: 66, roundRating: 831, sampleCount: 10 },
    { strokes: 67, roundRating: 820, sampleCount: 8 },
    { strokes: 68, roundRating: 809, sampleCount: 7 },
    { strokes: 69, roundRating: 798, sampleCount: 7 },
    { strokes: 70, roundRating: 787, sampleCount: 1 },
    { strokes: 71, roundRating: 776, sampleCount: 1 },
    { strokes: 72, roundRating: 765, sampleCount: 2 },
    { strokes: 73, roundRating: 753, sampleCount: 2 },
    { strokes: 74, roundRating: 742, sampleCount: 1 },
    { strokes: 76, roundRating: 720, sampleCount: 2 },
  ],
};

/**
 * Dretzka — PDGA events on the **27-hole** layout (par 81). Relative scores in the UI
 * should be vs this full layout, not an 18-hole casual loop. `displayName` is "Dretzka 27"
 * so the course dropdown reminds TDs.
 */
export const dretzkaRatingTable: CourseRatingTable = {
  id: "dretzka",
  displayName: "Dretzka 27",
  par: 81,
  points: [
    { strokes: 57, roundRating: 1047, sampleCount: 1 },
    { strokes: 59, roundRating: 1027, sampleCount: 1 },
    { strokes: 60, roundRating: 1017, sampleCount: 2 },
    { strokes: 61, roundRating: 1008, sampleCount: 4 },
    { strokes: 62, roundRating: 998, sampleCount: 1 },
    { strokes: 63, roundRating: 988, sampleCount: 2 },
    { strokes: 64, roundRating: 978, sampleCount: 4 },
    { strokes: 65, roundRating: 969, sampleCount: 4 },
    { strokes: 66, roundRating: 959, sampleCount: 6 },
    { strokes: 67, roundRating: 949, sampleCount: 14 },
    { strokes: 68, roundRating: 940, sampleCount: 10 },
    { strokes: 69, roundRating: 930, sampleCount: 15 },
    { strokes: 70, roundRating: 920, sampleCount: 11 },
    { strokes: 71, roundRating: 910, sampleCount: 12 },
    { strokes: 72, roundRating: 901, sampleCount: 13 },
    { strokes: 73, roundRating: 891, sampleCount: 14 },
    { strokes: 74, roundRating: 881, sampleCount: 12 },
    { strokes: 75, roundRating: 871, sampleCount: 14 },
    { strokes: 76, roundRating: 862, sampleCount: 13 },
    { strokes: 77, roundRating: 852, sampleCount: 10 },
    { strokes: 78, roundRating: 842, sampleCount: 11 },
    { strokes: 79, roundRating: 833, sampleCount: 10 },
    { strokes: 80, roundRating: 823, sampleCount: 4 },
    { strokes: 81, roundRating: 813, sampleCount: 6 },
    { strokes: 82, roundRating: 803, sampleCount: 4 },
    { strokes: 83, roundRating: 794, sampleCount: 4 },
    { strokes: 84, roundRating: 784, sampleCount: 1 },
    { strokes: 85, roundRating: 774, sampleCount: 1 },
    { strokes: 86, roundRating: 764, sampleCount: 5 },
    { strokes: 87, roundRating: 755, sampleCount: 1 },
    { strokes: 88, roundRating: 745, sampleCount: 1 },
    { strokes: 89, roundRating: 735, sampleCount: 2 },
    { strokes: 91, roundRating: 716, sampleCount: 1 },
    { strokes: 92, roundRating: 706, sampleCount: 1 },
    { strokes: 99, roundRating: 638, sampleCount: 1 },
  ],
};

export const COURSE_RATING_TABLES: Record<CourseRatingTableId, CourseRatingTable | null> = {
  brownDeer: brownDeerRatingTable,
  estabrook: estabrookRatingTable,
  dretzka: dretzkaRatingTable,
};

export function getCourseRatingTable(id: CourseRatingTableId): CourseRatingTable | null {
  return COURSE_RATING_TABLES[id];
}
