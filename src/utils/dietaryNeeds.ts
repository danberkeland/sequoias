export const DIETARY_OPTIONS = [
  {
    key: "dairyFree",
    label: "Dairy-free",
  },
  {
    key: "vegetarian",
    label: "Vegetarian",
  },
  {
    key: "wheatFree",
    label: "Wheat-free",
  },
  {
    key: "nutAllergy",
    label: "Nut allergy",
  },
] as const;

export type DietaryOptionKey =
  (typeof DIETARY_OPTIONS)[number]["key"];

export type DietarySelections = Record<
  DietaryOptionKey,
  boolean
>;

/**
 * Creates the default unchecked state for the four preset options.
 */
export function createEmptyDietarySelections(): DietarySelections {
  return {
    dairyFree: false,
    vegetarian: false,
    wheatFree: false,
    nutAllergy: false,
  };
}

/**
 * Converts the checkbox selections into the existing readable database field.
 *
 * Example:
 * "Dairy-free; Nut allergy; Other: No eggs"
 */
export function formatDietaryNeeds(
  selections: DietarySelections,
  otherDietaryNeeds: string
): string {
  const selectedLabels = DIETARY_OPTIONS
    .filter((option) => selections[option.key])
    .map((option) => option.label);

  const other = otherDietaryNeeds.trim();

  if (other) {
    selectedLabels.push(`Other: ${other}`);
  }

  return selectedLabels.join("; ");
}

/**
 * Converts a saved dietary-needs string back into checkbox state
 * when a family returns later to edit a camper.
 *
 * Older free-form dietary notes are preserved in the "Other" field.
 */
export function parseDietaryNeeds(
  value: string | null | undefined
): {
  selections: DietarySelections;
  otherDietaryNeeds: string;
} {
  const selections = createEmptyDietarySelections();
  const rawValue = value?.trim() ?? "";

  if (!rawValue || rawValue.toLowerCase() === "none") {
    return {
      selections,
      otherDietaryNeeds: "",
    };
  }

  const parts = rawValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const otherParts: string[] = [];

  parts.forEach((part) => {
    const matchingOption = DIETARY_OPTIONS.find(
      (option) =>
        option.label.toLowerCase() === part.toLowerCase()
    );

    if (matchingOption) {
      selections[matchingOption.key] = true;
      return;
    }

    if (part.toLowerCase().startsWith("other:")) {
      const otherValue = part.slice("other:".length).trim();

      if (otherValue) {
        otherParts.push(otherValue);
      }

      return;
    }

    /*
     * This preserves old free-form notes from before the checkbox
     * options existed.
     */
    otherParts.push(part);
  });

  return {
    selections,
    otherDietaryNeeds: otherParts.join("; "),
  };
}

