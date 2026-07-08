import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

export type CampBirthday = {
  camper: Camper;
  month: number;
  day: number;
  displayDate: string;
};

/**
 * Supports the usual HTML date-input format (YYYY-MM-DD)
 * and MM/DD/YYYY in case older applications used that format.
 */
function parseBirthdayMonthDay(
  value: string | null | undefined
): { month: number; day: number } | null {
  const birthday = value?.trim();

  if (!birthday) {
    return null;
  }

  const isoMatch = birthday.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoMatch) {
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    return month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
      ? { month, day }
      : null;
  }

  const usMatch = birthday.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (usMatch) {
    const month = Number(usMatch[1]);
    const day = Number(usMatch[2]);

    return month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
      ? { month, day }
      : null;
  }

  return null;
}

/**
 * Camp runs July 26 through August 2.
 * Birth years do not matter here—only month and day.
 */
function birthdayFallsDuringCamp(
  month: number,
  day: number
): boolean {
  return (
    (month === 7 && day >= 26) ||
    (month === 8 && day <= 2)
  );
}

function formatCampBirthday(
  month: number,
  day: number
): string {
  return new Date(2026, month - 1, day).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
    }
  );
}

export function getCampBirthdays(
  campers: Camper[],
  applications: SLDCApplication[]
): CampBirthday[] {
  const campersById = new Map(
    campers.map((camper) => [camper.id, camper])
  );

  const birthdays: CampBirthday[] = [];

  applications.forEach((application) => {
    const camper = campersById.get(application.camper_id);

    const birthday = parseBirthdayMonthDay(
      application.birthdate
    );

    if (
      !camper ||
      !birthday ||
      !birthdayFallsDuringCamp(
        birthday.month,
        birthday.day
      )
    ) {
      return;
    }

    birthdays.push({
      camper,
      month: birthday.month,
      day: birthday.day,
      displayDate: formatCampBirthday(
        birthday.month,
        birthday.day
      ),
    });
  });

  return birthdays.sort((a, b) => {
    const dateComparison =
      a.month - b.month || a.day - b.day;

    if (dateComparison !== 0) {
      return dateComparison;
    }

    const lastNameComparison = (
      a.camper.camper_last_name ?? ""
    ).localeCompare(
      b.camper.camper_last_name ?? ""
    );

    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }

    return (
      a.camper.camper_first_name ?? ""
    ).localeCompare(
      b.camper.camper_first_name ?? ""
    );
  });
}