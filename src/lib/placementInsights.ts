// Placement utility functions — ported from major MERN project

export function formatLpa(value: number | null | undefined): string {
  const n = Number(value || 0);
  return `${n.toFixed(n >= 10 ? 0 : 1)} LPA`;
}

function getMedian(values: number[]): number {
  const cleaned = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!cleaned.length) return 0;
  const mid = Math.floor(cleaned.length / 2);
  return cleaned.length % 2 === 0 ? (cleaned[mid - 1] + cleaned[mid]) / 2 : cleaned[mid];
}

export interface PlacementRow {
  branch: string;
  totalStudents: number;
  studentsPlaced: number;
  highestPackage: number;
  averagePackage: number;
  lowestPackage?: number;
  placementPercentage: number;
}

export interface YearlyPlacement {
  year: number;
  placements: PlacementRow[];
}

export interface YearSummary {
  year: number;
  totalStudents: number;
  studentsPlaced: number;
  highestPackage: number;
  averagePackage: number;
  medianPackage: number;
  placementRate: number;
  highestPlacementPercentage: number;
  branchCount: number;
  topBranch: { branch: string; placementPercentage: number } | null;
}

export function summarizePlacementYear(yearData: YearlyPlacement): YearSummary | null {
  if (!yearData?.placements?.length) return null;

  const summary = yearData.placements.reduce(
    (acc, row) => {
      const total = Number(row.totalStudents || 0);
      const placed = Number(row.studentsPlaced || 0);
      const highest = Number(row.highestPackage || 0);
      const avg = Number(row.averagePackage || 0);
      const pct = Number(row.placementPercentage || 0);

      acc.totalStudents += total;
      acc.studentsPlaced += placed;
      acc.weightedAverage += avg * Math.max(total, 1);
      acc.weightedAverageBase += Math.max(total, 1);
      acc.highestPackage = Math.max(acc.highestPackage, highest);
      acc.highestPlacementPercentage = Math.max(acc.highestPlacementPercentage, pct);
      acc.branchAveragePackages.push(avg);

      if (!acc.topBranch || pct > acc.topBranch.placementPercentage) {
        acc.topBranch = { branch: row.branch, placementPercentage: pct };
      }
      return acc;
    },
    {
      totalStudents: 0, studentsPlaced: 0, highestPackage: 0,
      highestPlacementPercentage: 0, weightedAverage: 0,
      weightedAverageBase: 0, branchAveragePackages: [] as number[],
      topBranch: null as { branch: string; placementPercentage: number } | null,
    }
  );

  const placementRate = summary.totalStudents
    ? (summary.studentsPlaced / summary.totalStudents) * 100 : 0;

  return {
    year: yearData.year,
    totalStudents: summary.totalStudents,
    studentsPlaced: summary.studentsPlaced,
    highestPackage: summary.highestPackage,
    averagePackage: summary.weightedAverageBase
      ? summary.weightedAverage / summary.weightedAverageBase : 0,
    medianPackage: getMedian(summary.branchAveragePackages),
    placementRate,
    highestPlacementPercentage: summary.highestPlacementPercentage,
    branchCount: yearData.placements.length,
    topBranch: summary.topBranch,
  };
}

export function summarizeAllYears(yearlyPlacements: YearlyPlacement[]): YearSummary[] {
  return [...yearlyPlacements]
    .map(summarizePlacementYear)
    .filter((s): s is YearSummary => s !== null)
    .sort((a, b) => b.year - a.year);
}

export function summarizePlacementCollection(placements: any[]): any[] {
  return placements
    .map((placement) => {
      const latestYear = [...(placement.yearlyPlacements || [])].sort(
        (a: any, b: any) => b.year - a.year
      )[0];
      const summary = summarizePlacementYear(latestYear);
      if (!summary || !placement.college?.name) return null;
      return {
        id: placement._id,
        collegeName: placement.college.name,
        year: summary.year,
        highestPackage: summary.highestPackage,
        averagePackage: summary.averagePackage,
        medianPackage: summary.medianPackage,
        placementRate: summary.placementRate,
        highestPlacementPercentage: summary.highestPlacementPercentage,
        topBranch: summary.topBranch,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) =>
      b.highestPackage !== a.highestPackage
        ? b.highestPackage - a.highestPackage
        : b.placementRate - a.placementRate
    );
}

export function buildPlacementFaqs({
  data, yearData, summaries = [],
}: { data: any; yearData: any; summaries?: YearSummary[] }) {
  if (!data || !yearData) {
    return [
      { question: "How should I read placement data on this page?", answer: "Start with the latest-year snapshot, then compare branch-wise packages and placement rates." },
      { question: "Why can one branch have a higher package but lower placement rate?", answer: "Higher packages often come from a smaller set of roles or companies, while placement rate reflects how broadly students across a branch were placed." },
      { question: "Should I compare colleges only by highest package?", answer: "No. Look at highest package, average package, branch-wise placement rate, and how consistently the college has performed across years." },
    ];
  }

  const selectedSummary = summarizePlacementYear(yearData);
  if (!selectedSummary) return [];
  const previousSummary = summaries.find((s) => s.year < selectedSummary.year) || null;
  const delta = previousSummary ? selectedSummary.placementRate - previousSummary.placementRate : 0;

  return [
    {
      question: `What does ${data.college?.name || "this college"} placement look like in ${yearData.year}?`,
      answer: `${selectedSummary.studentsPlaced} out of ${selectedSummary.totalStudents} students were placed across ${selectedSummary.branchCount} branches, giving an overall placement rate of ${selectedSummary.placementRate.toFixed(1)}%.`,
    },
    {
      question: `Which branch is leading in ${yearData.year}?`,
      answer: selectedSummary.topBranch
        ? `${selectedSummary.topBranch.branch} currently leads with a placement rate of ${selectedSummary.topBranch.placementPercentage.toFixed(1)}%.`
        : "No branch-level leader could be determined from the available data.",
    },
    {
      question: "How strong are the packages this year?",
      answer: `The highest package reported is ${formatLpa(selectedSummary.highestPackage)}, while the weighted average package across recorded branches is ${formatLpa(selectedSummary.averagePackage)}.`,
    },
    {
      question: "Is the trend improving compared with previous years?",
      answer: previousSummary
        ? `Compared with ${previousSummary.year}, the placement rate has ${delta >= 0 ? "improved" : "shifted down"} by ${Math.abs(delta).toFixed(1)} percentage points.`
        : "There is not enough older data on this page yet to compare the current year against a previous year.",
    },
  ];
}
