import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];

export type FamilyGroup = {
  key: string;
  name: string;
  campers: Camper[];
};

export function getFamilyGroups(campers: Camper[]): FamilyGroup[] {
  const groups = new Map<string, FamilyGroup>();

  campers.forEach((camper) => {
    /*
     * Use owner as the true grouping key. It identifies the
     * authenticated account that created the camper.
     *
     * The fallback handles legacy records if owner is unavailable.
     */
    const familyKey =
      camper.owner ??
      camper.family_name ??
      camper.camper_last_name ??
      camper.id;

    const rawFamilyName =
      camper.family_name?.trim() ||
      camper.camper_last_name?.trim() ||
      "Unknown";

    const displayName = rawFamilyName
      .toLowerCase()
      .endsWith("family")
      ? rawFamilyName
      : `${rawFamilyName} Family`;

    const existingGroup = groups.get(familyKey);

    if (existingGroup) {
      existingGroup.campers.push(camper);
    } else {
      groups.set(familyKey, {
        key: familyKey,
        name: displayName,
        campers: [camper],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}