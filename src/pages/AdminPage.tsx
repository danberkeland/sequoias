import { useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { useApplicationStage } from "../hooks/useApplicationStage";
import { useAdminCampData } from "../hooks/useAdminCampData";
import { useCamperStatusUpdates } from "../hooks/useCamperStatusUpdates";
import { ApplicationStageCard } from "../components/admin/ApplicationStageCard";
import { CampBirthdaysCard } from "../components/admin/CampBirthdaysCard";
import { MealCountsCard } from "../components/admin/MealCountsCard";
import { DrivingToFromCampCard } from "../components/admin/DrivingToFromCampCard";
import { DrivingAtCampCard } from "../components/admin/DrivingAtCampCard";
import { CampOverviewStats } from "../components/admin/CampOverviewStats";
import { RegisteredCampersTable } from "../components/admin/RegisteredCampersTable";
import {
  getCampBirthdays,
  type CampBirthday,
} from "../utils/adminBirthdays";

import {
  getDrivers,
  getTransportationSummary,
} from "../utils/adminTransportation";
import {
  getMealSummary,
  type MealSummary,
} from "../utils/adminMeals";
import {
  getFamilyGroups,
  type FamilyGroup,
} from "../utils/adminFamilies";


function AdminPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const { user, signOut } = useAuthenticator();
  const {
    isFinalPhase,
    settingsLoaded,
    isSavingPhase,
    changeApplicationPhase,
  } = useApplicationStage();

  const {
    campers,
    setCampers,
    applications,
  } = useAdminCampData(client);

  const {
    updateCamperStatus,
    updateFamilyStatus,
    isFamilyStatusChecked,
  } = useCamperStatusUpdates(client, campers, setCampers);

  const mealSummary = useMemo<MealSummary>(() => {
    return getMealSummary(campers);
  }, [campers]);


  const drivers = useMemo(() => {
    return getDrivers(campers);
  }, [campers]);

  const transportationSummary = useMemo(() => {
    return getTransportationSummary(drivers);
  }, [drivers]);

  const campBirthdays = useMemo<CampBirthday[]>(() => {
    return getCampBirthdays(campers, applications);
  }, [applications, campers]);

  const familyGroups = useMemo<FamilyGroup[]>(() => {
    return getFamilyGroups(campers);
  }, [campers]);


  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Sequoias Camp</p>
          <h1>Administrator Dashboard</h1>
          <p className="subtitle">
            Review camper registrations, waivers, attendance, and payments.
          </p>
        </div>

        <div className="account-box">
          <p className="account-label">Administrator</p>
          <p className="account-email">
            {user?.signInDetails?.loginId}
          </p>

          <Link to="/" className="secondary-button">
            Family application
          </Link>

          <button className="secondary-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

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

      <RegisteredCampersTable
        familyGroups={familyGroups}
        applications={applications}
        updateCamperStatus={updateCamperStatus}
        updateFamilyStatus={updateFamilyStatus}
        isFamilyStatusChecked={isFamilyStatusChecked}
      />
    </main>
  );
}

export default AdminPage;