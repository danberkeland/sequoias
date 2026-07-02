import type { Camper } from "../types";
import {
  CAMP_MEALS,
  type AttendanceSchedule,
} from "../constants/campSchedule";

export const STANDARD_CAMP_FEE = 525;
export const MB_CAMP_FEE = 375;

function getSchoolCode(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search)
    .get("school")
    ?.trim()
    .toLowerCase() ?? null;
}

export function getBaseCampFee(): number {
  return getSchoolCode() === "mb"
    ? MB_CAMP_FEE
    : STANDARD_CAMP_FEE;
}

export function isMountainBrookRegistration(): boolean {
  return getSchoolCode() === "mb";
}

export function formatCamperType(type: Camper["camper_type"]) {
  switch (type) {
    case "ATHLETE":
      return "Athlete";
    case "PARENT":
      return "Parent";
    case "NON_PARENT_ADULT_ALUMNI":
      return "Non-parent Adult/Alumni";
    case "SIBLING":
      return "Sibling";
    case "COACH":
      return "Coach";
    default:
      return "Not selected";
  }
}

export function getCamperFee(camper: Camper) {
  switch (camper.camper_type) {
    case "ATHLETE":
    return getBaseCampFee();
    case "NON_PARENT_ADULT_ALUMNI":
      return 100;
    case "SIBLING":
      return 50;
    case "PARENT":
    case "COACH":
    default:
      return 0;
  }
}

export function parseAttendanceSchedule(
  value: Camper["attendance_schedule"]
): AttendanceSchedule | null {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AttendanceSchedule;
    } catch (error) {
      console.error("Could not parse attendance schedule:", error);
      return null;
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as AttendanceSchedule;
  }

  return null;
}

export function getAttendanceSummary(camper: Camper) {
  if (camper.attending_full_camp) {
    return "Full camp";
  }

  const schedule = parseAttendanceSchedule(camper.attendance_schedule);

  if (!schedule) {
    return "Partial camp";
  }

  const attendingCount = CAMP_MEALS.filter((meal) => schedule[meal.id]).length;

  return `Partial camp — ${attendingCount} of ${CAMP_MEALS.length} meals`;
}

export function getTransportationSummary(camper: Camper) {
  if (!camper.is_driver) {
    return "Not driving";
  }

  return `Driving — Up: ${camper.empty_seats_to_camp ?? 0}, Home: ${
    camper.empty_seats_from_camp ?? 0
  }, At camp: ${camper.empty_seats_during_camp ?? 0}`;
}