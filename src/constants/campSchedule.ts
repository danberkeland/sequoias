export const CAMP_MEALS = [
  { id: "2026-07-26_DINNER", date: "July 26", meal: "Dinner" },

  { id: "2026-07-27_BREAKFAST", date: "July 27", meal: "Breakfast" },
  { id: "2026-07-27_LUNCH", date: "July 27", meal: "Lunch" },
  { id: "2026-07-27_DINNER", date: "July 27", meal: "Dinner" },

  { id: "2026-07-28_BREAKFAST", date: "July 28", meal: "Breakfast" },
  { id: "2026-07-28_LUNCH", date: "July 28", meal: "Lunch" },
  { id: "2026-07-28_DINNER", date: "July 28", meal: "Dinner" },

  { id: "2026-07-29_BREAKFAST", date: "July 29", meal: "Breakfast" },
  { id: "2026-07-29_LUNCH", date: "July 29", meal: "Lunch" },
  { id: "2026-07-29_DINNER", date: "July 29", meal: "Dinner" },

  { id: "2026-07-30_BREAKFAST", date: "July 30", meal: "Breakfast" },
  { id: "2026-07-30_LUNCH", date: "July 30", meal: "Lunch" },
  { id: "2026-07-30_DINNER", date: "July 30", meal: "Dinner" },

  { id: "2026-07-31_BREAKFAST", date: "July 31", meal: "Breakfast" },
  { id: "2026-07-31_LUNCH", date: "July 31", meal: "Lunch" },
  { id: "2026-07-31_DINNER", date: "July 31", meal: "Dinner" },

  { id: "2026-08-01_BREAKFAST", date: "Aug 1", meal: "Breakfast" },
  { id: "2026-08-01_LUNCH", date: "Aug 1", meal: "Lunch" },
  { id: "2026-08-01_DINNER", date: "Aug 1", meal: "Dinner" },

  { id: "2026-08-02_BREAKFAST", date: "Aug 2", meal: "Breakfast" },
];

export type AttendanceSchedule = Record<string, boolean>;

type CampMealCell = {
  id: string;
  label: "Breakfast" | "Lunch" | "Dinner";
} | null;

export const CAMP_DAYS: Array<{
  date: string;
  meals: CampMealCell[];
}> = [
  {
    date: "July 26",
    meals: [null, null, { id: "2026-07-26_DINNER", label: "Dinner" }],
  },
  {
    date: "July 27",
    meals: [
      { id: "2026-07-27_BREAKFAST", label: "Breakfast" },
      { id: "2026-07-27_LUNCH", label: "Lunch" },
      { id: "2026-07-27_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "July 28",
    meals: [
      { id: "2026-07-28_BREAKFAST", label: "Breakfast" },
      { id: "2026-07-28_LUNCH", label: "Lunch" },
      { id: "2026-07-28_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "July 29",
    meals: [
      { id: "2026-07-29_BREAKFAST", label: "Breakfast" },
      { id: "2026-07-29_LUNCH", label: "Lunch" },
      { id: "2026-07-29_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "July 30",
    meals: [
      { id: "2026-07-30_BREAKFAST", label: "Breakfast" },
      { id: "2026-07-30_LUNCH", label: "Lunch" },
      { id: "2026-07-30_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "July 31",
    meals: [
      { id: "2026-07-31_BREAKFAST", label: "Breakfast" },
      { id: "2026-07-31_LUNCH", label: "Lunch" },
      { id: "2026-07-31_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "Aug 1",
    meals: [
      { id: "2026-08-01_BREAKFAST", label: "Breakfast" },
      { id: "2026-08-01_LUNCH", label: "Lunch" },
      { id: "2026-08-01_DINNER", label: "Dinner" },
    ],
  },
  {
    date: "Aug 2",
    meals: [{ id: "2026-08-02_BREAKFAST", label: "Breakfast" }, null, null],
  },
];

export function createFullAttendanceSchedule(): AttendanceSchedule {
  return CAMP_MEALS.reduce((schedule, meal) => {
    schedule[meal.id] = true;
    return schedule;
  }, {} as AttendanceSchedule);
}