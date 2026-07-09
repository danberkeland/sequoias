import { Fragment } from "react";
import type { Schema } from "../../../amplify/data/resource";
import type { FamilyGroup } from "../../utils/adminFamilies";
import type {
  CamperStatusUpdate,
  FamilyStatusField,
} from "../../hooks/useCamperStatusUpdates";
import { FamilyGroupHeaderRow } from "./FamilyGroupHeaderRow";
import { RegisteredCamperRow } from "./RegisteredCamperRow";

type SLDCApplication = Schema["SLDCApplication"]["type"];

type RegisteredCampersTableProps = {
  familyGroups: FamilyGroup[];
  applications: SLDCApplication[];
  updateCamperStatus: (
    camperId: string,
    updates: CamperStatusUpdate
  ) => Promise<void>;
  updateFamilyStatus: (
    familyCampers: FamilyGroup["campers"],
    field: FamilyStatusField,
    checked: boolean
  ) => Promise<void>;
  isFamilyStatusChecked: (
    familyCampers: FamilyGroup["campers"],
    field: FamilyStatusField
  ) => boolean;
};

export function RegisteredCampersTable({
  familyGroups,
  applications,
  updateCamperStatus,
  updateFamilyStatus,
  isFamilyStatusChecked,
}: RegisteredCampersTableProps) {
  function getCamperSLDCApplication(
    camperId: string
  ): SLDCApplication | undefined {
    return applications.find(
      (application) => application.camper_id === camperId
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>All Registered Campers</h2>
          <p>Registrations submitted by all families</p>
        </div>
      </div>

      {familyGroups.length === 0 ? (
        <div className="empty-state">
          <h3>No campers found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="campers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SLDC Member</th>
                <th>SLDC Fee</th>
                <th>Camp Accepted</th>
                <th>Camp Fee</th>
                <th>Camp Waiver</th>
                <th>Type</th>
                <th>Attendance</th>
                <th>SLDC Waiver</th>
                <th>Dietary Needs</th>
                <th>Transportation</th>
              </tr>
            </thead>

            <tbody>
              {familyGroups.map((family) => (
                <Fragment key={family.key}>
                  <FamilyGroupHeaderRow
                    family={family}
                    columnCount={11}
                    isFamilyStatusChecked={isFamilyStatusChecked}
                    updateFamilyStatus={updateFamilyStatus}
                  />

                  {family.campers.map((camper) => (
                    <RegisteredCamperRow
                      key={camper.id}
                      camper={camper}
                      application={getCamperSLDCApplication(
                        camper.id
                      )}
                      updateCamperStatus={updateCamperStatus}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}