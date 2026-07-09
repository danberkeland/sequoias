import type { Schema } from "../../amplify/data/resource";
import { CAMP_DAYS } from "../constants/campSchedule";
import { parseAttendanceSchedule } from "./adminAttendance";

type Camper = Schema["Camper"]["type"];

/**
 * These are the camp days that have both breakfast and lunch.
 *
 * A driver is counted for daytime driving only if they are
 * attending both meals on that specific day.
 */
export const AT_CAMP_DRIVING_DAYS = CAMP_DAYS.flatMap((day) => {
  const breakfast = day.meals[0];
  const lunch = day.meals[1];

  if (!breakfast || !lunch) {
    return [];
  }

  return [
    {
      date: day.date,
      breakfastId: breakfast.id,
      lunchId: lunch.id,
    },
  ];
});

export type AtCampDrivingDay =
  (typeof AT_CAMP_DRIVING_DAYS)[number];

/**
 * Returns true only when this driver is present for both
 * breakfast and lunch on the specified camp day.
 */
export function driverIsAvailableAtCampOnDay(
  driver: Camper,
  day: AtCampDrivingDay
): boolean {
  if (driver.is_driver !== true) {
    return false;
  }

  /*
   * Treat an omitted attendance setting as full camp.
   * Full-camp drivers are present for every meal.
   */
  if (driver.attending_full_camp !== false) {
    return true;
  }

  const schedule = parseAttendanceSchedule(
    driver.attendance_schedule
  );

  return (
    schedule?.[day.breakfastId] === true &&
    schedule?.[day.lunchId] === true
  );
}

export function getDrivers(campers: Camper[]): Camper[] {
  return campers
    .filter((camper) => camper.is_driver === true)
    .sort((a, b) => {
      const lastNameComparison = (
        a.camper_last_name ?? ""
      ).localeCompare(b.camper_last_name ?? "");

      if (lastNameComparison !== 0) {
        return lastNameComparison;
      }

      return (a.camper_first_name ?? "").localeCompare(
        b.camper_first_name ?? ""
      );
    });
}

export function getTransportationSummary(drivers: Camper[]) {
  const toCampTotal = drivers.reduce(
    (total, driver) =>
      total +
      Math.max(
        0,
        driver.empty_seats_to_camp ?? 0
      ),
    0
  );

  const fromCampTotal = drivers.reduce(
    (total, driver) =>
      total +
      Math.max(
        0,
        driver.empty_seats_from_camp ?? 0
      ),
    0
  );

  const atCampDays = AT_CAMP_DRIVING_DAYS.map(
    (day) => {
      const availableDrivers = drivers.filter((driver) =>
        driverIsAvailableAtCampOnDay(driver, day)
      );

      const totalSeats = availableDrivers.reduce(
        (total, driver) =>
          total +
          Math.max(
            0,
            driver.empty_seats_during_camp ?? 0
          ),
        0
      );

      return {
        ...day,
        availableDrivers,
        totalSeats,
      };
    }
  );

  return {
    toCampTotal,
    fromCampTotal,
    atCampDays,
  };
}

export type TransportationSummary = ReturnType<
  typeof getTransportationSummary
>;