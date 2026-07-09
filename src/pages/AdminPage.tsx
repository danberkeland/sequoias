import { Fragment, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { printSLDCWaiver } from "../utils/printSLDCWaiver";
import { useApplicationStage } from "../hooks/useApplicationStage";
import { useAdminCampData } from "../hooks/useAdminCampData";
import { useCamperStatusUpdates } from "../hooks/useCamperStatusUpdates";
import { ApplicationStageCard } from "../components/admin/ApplicationStageCard";
import { CampBirthdaysCard } from "../components/admin/CampBirthdaysCard";
import { MealCountsCard } from "../components/admin/MealCountsCard";
import { DrivingToFromCampCard } from "../components/admin/DrivingToFromCampCard";
import { DrivingAtCampCard } from "../components/admin/DrivingAtCampCard";
import { CampOverviewStats } from "../components/admin/CampOverviewStats";
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


type SLDCApplication = Schema["SLDCApplication"]["type"];


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





  function getCamperSLDCApplication(
    camperId: string
  ): SLDCApplication | undefined {
    return applications.find(
      (application) => application.camper_id === camperId
    );
  }


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

      <section className="card">
        <div className="section-header">
          <div>
            <h2>All Registered Campers</h2>
            <p>
              Registrations submitted by all families
            </p>
          </div>
        </div>

        {campers.length === 0 ? (
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
                    <tr className="family-group-row">
                      <td colSpan={11}>
                        <div className="family-group-header">
                          <div>
                            <strong>{family.name}</strong>

                            <span className="family-member-count">
                              {family.campers.length === 1
                                ? "1 registered member"
                                : `${family.campers.length} registered members`}
                            </span>
                          </div>

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
                      </td>
                    </tr>

                    {family.campers.map((camper) => (
                      <tr key={camper.id}>
                        <td className="family-camper-name">
                          <strong>
                            {camper.camper_first_name}{" "}
                            {camper.camper_last_name}
                          </strong>
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={camper.isSLDCmember ?? false}
                            onChange={(event) =>
                              updateCamperStatus(camper.id, {
                                isSLDCmember: event.target.checked,
                              })
                            }
                            aria-label={`SLDC membership for ${camper.camper_first_name}`}
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={camper.isSLDCfee ?? false}
                            onChange={(event) =>
                              updateCamperStatus(camper.id, {
                                isSLDCfee: event.target.checked,
                              })
                            }
                            aria-label={`SLDC fee for ${camper.camper_first_name}`}
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={camper.isCampAccept ?? false}
                            onChange={(event) =>
                              updateCamperStatus(camper.id, {
                                isCampAccept: event.target.checked,
                              })
                            }
                            aria-label={`Camp acceptance for ${camper.camper_first_name}`}
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={camper.isCampFee ?? false}
                            onChange={(event) =>
                              updateCamperStatus(camper.id, {
                                isCampFee: event.target.checked,
                              })
                            }
                            aria-label={`Camp fee for ${camper.camper_first_name}`}
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={camper.isCampWaiver ?? false}
                            onChange={(event) =>
                              updateCamperStatus(camper.id, {
                                isCampWaiver: event.target.checked,
                              })
                            }
                            aria-label={`Camp waiver for ${camper.camper_first_name}`}
                          />
                        </td>

                        <td>{camper.camper_type ?? "Not selected"}</td>

                        <td>
                          {camper.attending_full_camp
                            ? "Full camp"
                            : "Partial camp"}
                        </td>

                        <td>
                          {(() => {
                            const application =
                              getCamperSLDCApplication(camper.id);

                            if (!application) {
                              return (
                                <span className="waiver-not-submitted">
                                  Not submitted
                                </span>
                              );
                            }

                            return (
                              <div className="admin-waiver-actions">
                                <span className="waiver-submitted">
                                  Submitted
                                </span>

                                <button
                                  type="button"
                                  className="print-waiver-button"
                                  onClick={() =>
                                    printSLDCWaiver(camper, application)
                                  }
                                >
                                  Print Waiver
                                </button>
                              </div>
                            );
                          })()}
                        </td>

                        <td>
                          {camper.special_dietary_needs || "None"}
                        </td>

                        <td>
                          {camper.is_driver
                            ? `Driver — ${camper.empty_seats_to_camp ?? 0
                            } up, ${camper.empty_seats_from_camp ?? 0
                            } home`
                            : "Not driving"}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPage;