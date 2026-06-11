import type { Schema } from "../amplify/data/resource";

export type Camper = Schema["Camper"]["type"];

export type CamperType =
  | "ATHLETE"
  | "PARENT"
  | "NON_PARENT_ADULT_ALUMNI"
  | "SIBLING"
  | "COACH";

export type Size = "XS" | "S" | "M" | "L" | "XL";