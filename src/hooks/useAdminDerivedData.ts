import { useMemo } from "react";
import type { Schema } from "../../amplify/data/resource";
import { getCampBirthdays, type CampBirthday } from "../utils/adminBirthdays";
import { getFamilyGroups, type FamilyGroup } from "../utils/adminFamilies";
import { getMealSummary, type MealSummary } from "../utils/adminMeals";
import {
  getDrivers,
  getTransportationSummary,
  type TransportationSummary,
} from "../utils/adminTransportation";

import {
  getApparelSizeTotals,
  type ApparelSizeTotals,
} from "../utils/adminApparel";

import {
  getDietaryRestrictionSummary,
  type DietaryRestrictionSummary,
} from "../utils/adminDietary";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

export function useAdminDerivedData(
  campers: Camper[],
  applications: SLDCApplication[],
) {
  const mealSummary = useMemo<MealSummary>(() => {
    return getMealSummary(campers);
  }, [campers]);

  const drivers = useMemo(() => {
    return getDrivers(campers);
  }, [campers]);

  const apparelSizeTotals = useMemo<ApparelSizeTotals>(() => {
    return getApparelSizeTotals(campers);
  }, [campers]);

  const transportationSummary = useMemo<TransportationSummary>(() => {
    return getTransportationSummary(drivers);
  }, [drivers]);

  const campBirthdays = useMemo<CampBirthday[]>(() => {
    return getCampBirthdays(campers, applications);
  }, [applications, campers]);

  const familyGroups = useMemo<FamilyGroup[]>(() => {
    return getFamilyGroups(campers);
  }, [campers]);

  const dietaryRestrictionSummary =
  useMemo<DietaryRestrictionSummary>(() => {
    return getDietaryRestrictionSummary(campers);
  }, [campers]);

  return {
  mealSummary,
  drivers,
  transportationSummary,
  campBirthdays,
  familyGroups,
  apparelSizeTotals,
  dietaryRestrictionSummary,
};
}
