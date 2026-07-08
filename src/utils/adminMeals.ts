import type { Schema } from "../../amplify/data/resource";
import { CAMP_MEALS } from "../constants/campSchedule";
import { parseAttendanceSchedule } from "./adminAttendance";

type Camper = Schema["Camper"]["type"];

export type MealSummary = {
  totals: Record<string, number>;
  incompleteAttendanceRecords: number;
};

export function getMealSummary(campers: Camper[]): MealSummary {
  const totals: Record<string, number> = {};

  CAMP_MEALS.forEach((meal) => {
    totals[meal.id] = 0;
  });

  let incompleteAttendanceRecords = 0;

  campers.forEach((camper) => {
    // Full-camp campers attend every scheduled meal.
    if (camper.attending_full_camp === true) {
      CAMP_MEALS.forEach((meal) => {
        totals[meal.id] += 1;
      });

      return;
    }

    const schedule = parseAttendanceSchedule(
      camper.attendance_schedule
    );

    if (!schedule) {
      incompleteAttendanceRecords += 1;
      return;
    }

    CAMP_MEALS.forEach((meal) => {
      if (schedule[meal.id] === true) {
        totals[meal.id] += 1;
      }
    });
  });

  return {
    totals,
    incompleteAttendanceRecords,
  };
}