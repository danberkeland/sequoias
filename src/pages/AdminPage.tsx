import { useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../amplify/data/resource";
import { useApplicationStage } from "../hooks/useApplicationStage";
import { useAdminCampData } from "../hooks/useAdminCampData";
import { useCamperStatusUpdates } from "../hooks/useCamperStatusUpdates";
import { RegisteredCampersTable } from "../components/admin/RegisteredCampersTable";
import { AdminHero } from "../components/admin/AdminHero";
import { CampOverviewSection } from "../components/admin/CampOverviewSection";
import { useAdminDerivedData } from "../hooks/useAdminDerivedData";


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
    campWaivers,
  } = useAdminCampData(client);

  const {
    updateCamperStatus,
    updateFamilyStatus,
    isFamilyStatusChecked,
  } = useCamperStatusUpdates(client, campers, setCampers);
  const {
    mealSummary,
    drivers,
    transportationSummary,
    campBirthdays,
    familyGroups,
    apparelSizeTotals,
    dietaryRestrictionSummary,
  } = useAdminDerivedData(campers, applications);
  return (
    <main className="app-shell">
      <AdminHero
        loginId={user?.signInDetails?.loginId}
        signOut={signOut}
      />

      <CampOverviewSection
        campers={campers}
        applications={applications}
        isFinalPhase={isFinalPhase}
        settingsLoaded={settingsLoaded}
        isSavingPhase={isSavingPhase}
        changeApplicationPhase={changeApplicationPhase}
        campBirthdays={campBirthdays}
        apparelSizeTotals={apparelSizeTotals}
        dietaryRestrictionSummary={dietaryRestrictionSummary}
        mealSummary={mealSummary}
        drivers={drivers}
        transportationSummary={transportationSummary}
      />

      <RegisteredCampersTable
        familyGroups={familyGroups}
        applications={applications}
        campWaivers={campWaivers}
        updateCamperStatus={updateCamperStatus}
        updateFamilyStatus={updateFamilyStatus}
        isFamilyStatusChecked={isFamilyStatusChecked}
      />
    </main>
  );
}

export default AdminPage;