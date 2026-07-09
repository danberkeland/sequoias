import { useMemo } from "react";
import type { Schema } from "../../amplify/data/resource";
import {
  getCampBirthdays,
  type CampBirthday,
} from "../utils/adminBirthdays";
import {
  getFamilyGroups,
  type FamilyGroup,
} from "../utils/adminFamilies";
import {
  getMealSummary,
  type MealSummary,
} from "../utils/adminMeals";
import {
  getDrivers,
  getTransportationSummary,
  type TransportationSummary,
} from "../utils/adminTransportation";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

export function useAdminDerivedData(
  campers: Camper[],
  applications: SLDCApplication[]
) {
  const mealSummary = useMemo<MealSummary>(() => {
    return getMealSummary(campers);
  }, [campers]);

  const drivers = useMemo(() => {
    return getDrivers(campers);
  }, [campers]);

  const transportationSummary =
    useMemo<TransportationSummary>(() => {
      return getTransportationSummary(drivers);
    }, [drivers]);

  const campBirthdays = useMemo<CampBirthday[]>(() => {
    return getCampBirthdays(campers, applications);
  }, [applications, campers]);

  const familyGroups = useMemo<FamilyGroup[]>(() => {
    return getFamilyGroups(campers);
  }, [campers]);

  return {
    mealSummary,
    drivers,
    transportationSummary,
    campBirthdays,
    familyGroups,
  };
}