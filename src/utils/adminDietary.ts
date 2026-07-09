import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];

export type DietaryRestrictionSummaryRow = {
  restriction: string;
  camperNames: string[];
  count: number;
};

export type DietaryRestrictionSummary = {
  rows: DietaryRestrictionSummaryRow[];
  camperCount: number;
};

function getCamperName(camper: Camper): string {
  return [
    camper.camper_first_name,
    camper.camper_last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function parseDietaryRestrictions(
  value: string | null | undefined
): string[] {
  const rawValue = value?.trim();

  if (!rawValue || rawValue.toLowerCase() === "none") {
    return [];
  }

  return rawValue
    .split(/[,;\n]/)
    .map((restriction) => restriction.trim())
    .filter(Boolean)
    .filter(
      (restriction) =>
        restriction.toLowerCase() !== "none" &&
        restriction.toLowerCase() !== "no restrictions" &&
        restriction.toLowerCase() !== "no dietary restrictions"
    );
}

export function getDietaryRestrictionSummary(
  campers: Camper[]
): DietaryRestrictionSummary {
  const restrictionMap = new Map<string, Set<string>>();
  const campersWithRestrictions = new Set<string>();

  campers.forEach((camper) => {
    const camperName = getCamperName(camper);
    const restrictions = parseDietaryRestrictions(
      camper.special_dietary_needs
    );

    if (restrictions.length === 0) {
      return;
    }

    campersWithRestrictions.add(camper.id);

    restrictions.forEach((restriction) => {
      const existingCampers =
        restrictionMap.get(restriction) ?? new Set<string>();

      existingCampers.add(camperName || "Unnamed camper");

      restrictionMap.set(restriction, existingCampers);
    });
  });

  const rows = Array.from(restrictionMap.entries())
    .map(([restriction, camperSet]) => {
      const camperNames = Array.from(camperSet).sort((a, b) =>
        a.localeCompare(b)
      );

      return {
        restriction,
        camperNames,
        count: camperNames.length,
      };
    })
    .sort((a, b) => {
      const countComparison = b.count - a.count;

      if (countComparison !== 0) {
        return countComparison;
      }

      return a.restriction.localeCompare(b.restriction);
    });

  return {
    rows,
    camperCount: campersWithRestrictions.size,
  };
}