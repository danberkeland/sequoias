import { useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import type { FamilyGroup } from "../../utils/adminFamilies";
import type {
  CamperStatusUpdate,
  FamilyStatusField,
} from "../../hooks/useCamperStatusUpdates";
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

const ATHLETE_CAMP_FEE = 575;
const ADDITIONAL_ADULT_CAMP_FEE = 100;
const SIBLING_CAMP_FEE = 50;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getFamilyCampFeeAmount(
  family: FamilyGroup
): number {
  const athleteCount = family.campers.filter(
    (camper) => camper.camper_type === "ATHLETE"
  ).length;

  const parentCount = family.campers.filter(
    (camper) => camper.camper_type === "PARENT"
  ).length;

  const additionalAdultCount = family.campers.filter(
    (camper) =>
      camper.camper_type === "NON_PARENT_ADULT_ALUMNI"
  ).length;

  const siblingCount = family.campers.filter(
    (camper) => camper.camper_type === "SIBLING"
  ).length;

  /*
   * One parent is included with the family camp fee.
   * Additional parents are charged as additional adults.
   */
  const includedParentCount = athleteCount > 0 ? 1 : 0;

  const paidParentCount = Math.max(
    0,
    parentCount - includedParentCount
  );

  return (
    athleteCount * ATHLETE_CAMP_FEE +
    paidParentCount * ADDITIONAL_ADULT_CAMP_FEE +
    additionalAdultCount * ADDITIONAL_ADULT_CAMP_FEE +
    siblingCount * SIBLING_CAMP_FEE
  );
}

function formatCampFee(amount: number): string {
  return currencyFormatter.format(amount);
}

export function RegisteredCampersTable({
  familyGroups,
  applications,
  updateCamperStatus,
  updateFamilyStatus,
  isFamilyStatusChecked,
}: RegisteredCampersTableProps) {
  const [expandedFamilyKeys, setExpandedFamilyKeys] =
    useState<Set<string>>(new Set());

  function getCamperSLDCApplication(
    camperId: string
  ): SLDCApplication | undefined {
    return applications.find(
      (application) => application.camper_id === camperId
    );
  }

  function toggleFamily(familyKey: string) {
    setExpandedFamilyKeys((current) => {
      const next = new Set(current);

      if (next.has(familyKey)) {
        next.delete(familyKey);
      } else {
        next.add(familyKey);
      }

      return next;
    });
  }

  function expandAllFamilies() {
    setExpandedFamilyKeys(
      new Set(familyGroups.map((family) => family.key))
    );
  }

  function collapseAllFamilies() {
    setExpandedFamilyKeys(new Set());
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>All Registered Campers</h2>
          <p>Registrations submitted by all families</p>
        </div>

        {familyGroups.length > 0 && (
          <div className="family-card-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={expandAllFamilies}
            >
              Expand all
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={collapseAllFamilies}
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      {familyGroups.length === 0 ? (
        <div className="empty-state">
          <h3>No campers found</h3>
        </div>
      ) : (
        <div className="family-card-list">
          {familyGroups.map((family, index) => {
            const isExpanded = expandedFamilyKeys.has(
              family.key
            );

            const panelId = `family-card-panel-${index}`;

            return (
              <section
                key={family.key}
                className={
                  isExpanded
                    ? "family-card is-expanded"
                    : "family-card"
                }
              >
                <div className="family-card-header">
                  <button
                    type="button"
                    className="family-card-toggle"
                    onClick={() => toggleFamily(family.key)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                  >
                    <span className="family-card-chevron">
                      {isExpanded ? "▾" : "▸"}
                    </span>

                    <span>
                      <strong>{family.name}</strong>

                      <span className="family-card-meta">
                        <span className="family-member-count">
                          {family.campers.length === 1
                            ? "1 registered member"
                            : `${family.campers.length} registered members`}
                        </span>

                        <span className="family-camp-fee-pill">
                          Camp Fee: {formatCampFee(
                            getFamilyCampFeeAmount(family)
                          )}
                        </span>
                      </span>
                    </span>
                  </button>

                  <div className="family-group-statuses">
                    <label>
                      <input
                        type="checkbox"
                        checked={isFamilyStatusChecked(
                          family.campers,
                          "isSLDCfee"
                        )}
                        onChange={(event) =>
                          updateFamilyStatus(
                            family.campers,
                            "isSLDCfee",
                            event.target.checked
                          )
                        }
                      />

                      <span>SLDC Fee</span>
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={isFamilyStatusChecked(
                          family.campers,
                          "isCampAccept"
                        )}
                        onChange={(event) =>
                          updateFamilyStatus(
                            family.campers,
                            "isCampAccept",
                            event.target.checked
                          )
                        }
                      />

                      <span>Camp Accepted</span>
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={isFamilyStatusChecked(
                          family.campers,
                          "isCampFee"
                        )}
                        onChange={(event) =>
                          updateFamilyStatus(
                            family.campers,
                            "isCampFee",
                            event.target.checked
                          )
                        }
                      />

                      <span>Camp Fee</span>
                    </label>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    id={panelId}
                    className="family-card-body"
                  >
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
                          {family.campers.map((camper) => (
                            <RegisteredCamperRow
                              key={camper.id}
                              camper={camper}
                              application={getCamperSLDCApplication(
                                camper.id
                              )}
                              updateCamperStatus={
                                updateCamperStatus
                              }
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}