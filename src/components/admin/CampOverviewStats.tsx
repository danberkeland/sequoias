import type { Schema } from "../../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

type CampOverviewStatsProps = {
  campers: Camper[];
  applications: SLDCApplication[];
};

export function CampOverviewStats({
  campers,
  applications,
}: CampOverviewStatsProps) {
  const waiversRemaining = campers.filter(
    (camper) =>
      !applications.some(
        (application) => application.camper_id === camper.id
      )
  ).length;

  return (
    <div className="admin-summary-grid">
      <div className="admin-summary-box">
        <span>Registered Campers</span>
        <strong>{campers.length}</strong>
      </div>

      <div className="admin-summary-box">
        <span>SLDC Applications</span>
        <strong>{applications.length}</strong>
      </div>

      <div className="admin-summary-box">
        <span>Waivers Remaining</span>
        <strong>{waiversRemaining}</strong>
      </div>
    </div>
  );
}