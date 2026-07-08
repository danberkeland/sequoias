import type { Schema } from "../../amplify/data/resource";
import type { AttendanceSchedule } from "../constants/campSchedule";

type Camper = Schema["Camper"]["type"];

export function parseAttendanceSchedule(
  value: Camper["attendance_schedule"]
): AttendanceSchedule | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AttendanceSchedule;
    } catch (error) {
      console.error(
        "Could not parse camper attendance schedule:",
        error
      );

      return null;
    }
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as AttendanceSchedule;
  }

  return null;
}