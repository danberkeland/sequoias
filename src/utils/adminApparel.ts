import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];

export type ApparelCategory = "athlete" | "sibling" | "rest";

export type ApparelSizeRow = {
  size: string;
  athlete: number;
  sibling: number;
  rest: number;
  total: number;
};

export type ApparelSizeTotals = {
  shirtRows: ApparelSizeRow[];
  sweatshirtRows: ApparelSizeRow[];
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function getApparelCategory(camper: Camper): ApparelCategory {
  if (camper.camper_type === "ATHLETE") {
    return "athlete";
  }

  if (camper.camper_type === "SIBLING") {
    return "sibling";
  }

  return "rest";
}

function normalizeSize(value: unknown): string | null {
  const size = String(value ?? "").trim().toUpperCase();

  return size || null;
}

function getSizeRank(size: string): number {
  const rank = SIZE_ORDER.indexOf(size);

  return rank === -1 ? SIZE_ORDER.length : rank;
}

function buildSizeRows(
  campers: Camper[],
  field: "shirt_size" | "sweatshirt_size"
): ApparelSizeRow[] {
  const rowsBySize = new Map<string, ApparelSizeRow>();

  campers.forEach((camper) => {
    const size = normalizeSize(camper[field]);

    if (!size) {
      return;
    }

    const category = getApparelCategory(camper);

    const existingRow =
      rowsBySize.get(size) ??
      {
        size,
        athlete: 0,
        sibling: 0,
        rest: 0,
        total: 0,
      };

    existingRow[category] += 1;
    existingRow.total += 1;

    rowsBySize.set(size, existingRow);
  });

  return Array.from(rowsBySize.values()).sort((a, b) => {
    const rankComparison =
      getSizeRank(a.size) - getSizeRank(b.size);

    if (rankComparison !== 0) {
      return rankComparison;
    }

    return a.size.localeCompare(b.size);
  });
}

export function getApparelSizeTotals(
  campers: Camper[]
): ApparelSizeTotals {
  return {
    shirtRows: buildSizeRows(campers, "shirt_size"),
    sweatshirtRows: buildSizeRows(campers, "sweatshirt_size"),
  };
}