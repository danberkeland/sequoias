import type { Schema } from "../../../amplify/data/resource";
import type { CampBirthday } from "../../utils/adminBirthdays";
import type { MealSummary } from "../../utils/adminMeals";
import type { TransportationSummary } from "../../utils/adminTransportation";
import { ApplicationStageCard } from "./ApplicationStageCard";
import { CampBirthdaysCard } from "./CampBirthdaysCard";
import { CampOverviewStats } from "./CampOverviewStats";
import { DrivingAtCampCard } from "./DrivingAtCampCard";
import { DrivingToFromCampCard } from "./DrivingToFromCampCard";
import { MealCountsCard } from "./MealCountsCard";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

type CampOverviewSectionProps = {
  campers: Camper[];
  applications: SLDCApplication[];
  isFinalPhase: boolean;
  settingsLoaded: boolean;
  isSavingPhase: boolean;
  changeApplicationPhase: (nextIsFinal: boolean) => void;
  campBirthdays: CampBirthday[];
  mealSummary: MealSummary;
  drivers: Camper[];
  transportationSummary: TransportationSummary;
};

export function CampOverviewSection({
  campers,
  applications,
  isFinalPhase,
  settingsLoaded,
  isSavingPhase,
  changeApplicationPhase,
  campBirthdays,
  mealSummary,
  drivers,
  transportationSummary,
}: CampOverviewSectionProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Camp Overview</h2>
          <p>Current registration totals</p>
        </div>

        <ApplicationStageCard
          isFinalPhase={isFinalPhase}
          settingsLoaded={settingsLoaded}
          isSavingPhase={isSavingPhase}
          changeApplicationPhase={changeApplicationPhase}
        />
      </div>

      <CampOverviewStats
        campers={campers}
        applications={applications}
      />

      <CampBirthdaysCard campBirthdays={campBirthdays} />

      <MealCountsCard
        registeredCamperCount={campers.length}
        mealSummary={mealSummary}
      />

      <DrivingToFromCampCard
        drivers={drivers}
        transportationSummary={transportationSummary}
      />

      <DrivingAtCampCard
        drivers={drivers}
        transportationSummary={transportationSummary}
      />
    </section>
  );
}