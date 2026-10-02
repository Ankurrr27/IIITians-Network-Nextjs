export interface TermSortParts {
  start: number;
  end: number;
  isRange: boolean;
}

export function getTermSortParts(name: string): TermSortParts {
  const match = name.trim().match(/^(\d{2,4})(?:\s*[-/]\s*(\d{2,4}))?/);
  if (!match) return { start: -1, end: -1, isRange: false };

  const start = Number(match[1].length === 2 ? `20${match[1]}` : match[1]);
  const rawEnd = match[2];
  const end = rawEnd
    ? Number(rawEnd.length === 2 ? `${String(start + 1).slice(0, 2)}${rawEnd}` : rawEnd)
    : start;
  return { start, end, isRange: Boolean(rawEnd) };
}

export function compareTermsNewestFirst(leftName: string, rightName: string): number {
  const left = getTermSortParts(leftName);
  const right = getTermSortParts(rightName);
  return right.start - left.start ||
    Number(right.isRange) - Number(left.isRange) ||
    right.end - left.end ||
    leftName.localeCompare(rightName, undefined, { numeric: true, sensitivity: "base" });
}
