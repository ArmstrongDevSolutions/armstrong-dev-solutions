import type { CourseRatingTable, CourseRatingTableId } from "./courseEstimatedRatingData";
import { getCourseRatingTable } from "./courseEstimatedRatingData";

/** Practical input window per course (vs par). Values outside are clamped before lookup. */
export const RELATIVE_SCORE_CLAMP: Record<CourseRatingTableId, { min: number; max: number }> = {
  brownDeer: { min: -10, max: 29 },
  estabrook: { min: -10, max: 20 },
  dretzka: { min: -24, max: 18 },
};

/**
 * Parse relative score: E / e = even; +6, -2, 6 (treated as +6 over).
 * Returns null if empty or not a complete token.
 */
export function parseRelativeScoreToDelta(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^e$/i.test(t)) return 0;
  const m = t.match(/^([+-]?)(\d+)$/);
  if (!m) return null;
  const signChar = m[1];
  const n = Number(m[2]);
  if (!Number.isFinite(n)) return null;
  if (signChar === "-") return -n;
  return n;
}

export function clampRelativeDelta(delta: number, courseId: CourseRatingTableId): number {
  const { min, max } = RELATIVE_SCORE_CLAMP[courseId];
  return Math.min(max, Math.max(min, delta));
}

/** Linear interpolation of round rating vs strokes; extrapolates from end segments outside the table. */
export function interpolateRoundRatingFromStrokes(table: CourseRatingTable, strokes: number): number {
  const pts = table.points;
  if (pts.length === 0) return 0;
  if (pts.length === 1) return pts[0].roundRating;

  if (strokes <= pts[0].strokes) {
    const p0 = pts[0];
    const p1 = pts[1];
    const span = p1.strokes - p0.strokes;
    if (span === 0) return p0.roundRating;
    const m = (p1.roundRating - p0.roundRating) / span;
    return Math.round(p0.roundRating + m * (strokes - p0.strokes));
  }

  const last = pts[pts.length - 1];
  if (strokes >= last.strokes) {
    if (pts.length < 2) return last.roundRating;
    const p0 = pts[pts.length - 2];
    const p1 = pts[pts.length - 1];
    const span = p1.strokes - p0.strokes;
    if (span === 0) return p1.roundRating;
    const m = (p1.roundRating - p0.roundRating) / span;
    return Math.round(p0.roundRating + m * (strokes - p0.strokes));
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (a.strokes <= strokes && strokes <= b.strokes) {
      if (a.strokes === b.strokes) return a.roundRating;
      const t = (strokes - a.strokes) / (b.strokes - a.strokes);
      return Math.round(a.roundRating + t * (b.roundRating - a.roundRating));
    }
  }
  return last.roundRating;
}

export function estimateRatingFromCourseAndRelativeDelta(
  courseId: CourseRatingTableId,
  relativeDelta: number,
): number | null {
  const table = getCourseRatingTable(courseId);
  if (!table) return null;
  const clamped = clampRelativeDelta(relativeDelta, courseId);
  const strokes = table.par + clamped;
  return interpolateRoundRatingFromStrokes(table, strokes);
}
