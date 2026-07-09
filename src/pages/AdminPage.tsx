import { Fragment, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { printSLDCWaiver } from "../utils/printSLDCWaiver";
import { useApplicationStage } from "../hooks/useApplicationStage";
import { useAdminCampData } from "../hooks/useAdminCampData";
import { useCamperStatusUpdates } from "../hooks/useCamperStatusUpdates";

import {
  getCampBirthdays,
  type CampBirthday,
} from "../utils/adminBirthdays";
import { CAMP_DAYS } from "../constants/campSchedule";
import {
  AT_CAMP_DRIVING_DAYS,
  driverIsAvailableAtCampOnDay,
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

  function camperHasSLDCApplication(
    camperId: string
  ): boolean {
    return Boolean(getCamperSLDCApplication(camperId));
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

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Application Stage</h2>

                <p>
                  Control which portions of the camp application
                  families can access.
                </p>
              </div>
            </div>

            {!settingsLoaded ? (
              <p>Loading application stage…</p>
            ) : (
              <div className="application-stage-panel">
                <div>
                  <strong>
                    {isFinalPhase
                      ? "Final Application"
                      : "Preliminary Interest Form"}
                  </strong>

                  <p>
                    {isFinalPhase
                      ? "Families can access all registration, waiver, and payment steps."
                      : "Families can access only Step 1 to indicate interest in camp."}
                  </p>
                </div>

                <label className="phase-switch">
                  <span
                    className={
                      !isFinalPhase
                        ? "phase-label is-active"
                        : "phase-label"
                    }
                  >
                    Preliminary
                  </span>

                  <input
                    type="checkbox"
                    checked={isFinalPhase}
                    disabled={isSavingPhase}
                    onChange={(event) =>
                      changeApplicationPhase(
                        event.target.checked
                      )
                    }
                    aria-label="Switch application between preliminary and final"
                  />

                  <span className="phase-switch-slider" />

                  <span
                    className={
                      isFinalPhase
                        ? "phase-label is-active"
                        : "phase-label"
                    }
                  >
                    Final
                  </span>
                </label>
              </div>
            )}
          </section>

        </div>
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
            <strong>
              {
                campers.filter(
                  (camper) => !camperHasSLDCApplication(camper.id)
                ).length
              }
            </strong>
          </div>
        </div>
        <section className="card camp-birthdays-card">
          <div className="section-header">
            <div>
              <h2>Camp Birthdays</h2>

              <p>
                Registered campers with birthdays between July 26
                and August 2
              </p>
            </div>

            <span className="birthday-count">
              {campBirthdays.length}
            </span>
          </div>

          {campBirthdays.length === 0 ? (
            <div className="empty-state">
              <h3>No camp birthdays listed</h3>

              <p>
                No registered campers currently have birthdays
                during the camp dates.
              </p>
            </div>
          ) : (
            <ul className="camp-birthday-list">
              {campBirthdays.map((birthday) => (
                <li
                  key={birthday.camper.id}
                  className="camp-birthday-item"
                >
                  <div>
                    <strong>
                      {birthday.camper.camper_first_name}{" "}
                      {birthday.camper.camper_last_name}
                    </strong>

                    {birthday.camper.family_name && (
                      <span className="birthday-family-name">
                        {birthday.camper.family_name} Family
                      </span>
                    )}
                  </div>

                  <span className="birthday-date">
                    {birthday.displayDate}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Camp Meal Counts</h2>
              <p>
                Number of registered campers expected at each meal
              </p>
            </div>
          </div>

          {campers.length === 0 ? (
            <div className="empty-state">
              <h3>No campers registered</h3>
              <p>Meal totals will appear here.</p>
            </div>
          ) : (
            <>
              <div className="meal-count-summary">
                <span>Registered campers</span>
                <strong>{campers.length}</strong>
              </div>

              <div className="table-wrap">
                <table className="meal-count-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Breakfast</th>
                      <th>Lunch</th>
                      <th>Dinner</th>
                    </tr>
                  </thead>

                  <tbody>
                    {CAMP_DAYS.map((day) => (
                      <tr key={day.date}>
                        <th scope="row">{day.date}</th>

                        {day.meals.map((meal, index) => (
                          <td key={meal?.id ?? `${day.date}-${index}`}>
                            {meal ? (
                              <strong>
                                {mealSummary.totals[meal.id] ?? 0}
                              </strong>
                            ) : (
                              <span className="no-meal">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mealSummary.incompleteAttendanceRecords > 0 && (
                <div className="meal-count-warning">
                  <strong>Attendance information incomplete:</strong>{" "}
                  {mealSummary.incompleteAttendanceRecords === 1
                    ? "1 partial-camp camper does not have a readable meal schedule."
                    : `${mealSummary.incompleteAttendanceRecords} partial-camp campers do not have readable meal schedules.`}
                </div>
              )}
            </>
          )}
        </section>
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Driving To and From Camp</h2>

              <p>
                Open passenger seats offered for travel to camp
                and the trip home.
              </p>
            </div>
          </div>

          {drivers.length === 0 ? (
            <div className="empty-state">
              <h3>No drivers registered</h3>

              <p>
                Drivers will appear here once transportation
                information has been submitted.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="driver-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Going Up</th>
                    <th>Coming Down</th>
                  </tr>
                </thead>

                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td>
                        <strong>
                          {driver.camper_first_name}{" "}
                          {driver.camper_last_name}
                        </strong>

                        {driver.family_name && (
                          <span className="driver-family-name">
                            {driver.family_name} Family
                          </span>
                        )}
                      </td>

                      <td>
                        {driver.empty_seats_to_camp ?? 0}
                      </td>

                      <td>
                        {driver.empty_seats_from_camp ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th>Total Open Seats</th>

                    <td>
                      <strong>
                        {transportationSummary.toCampTotal}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {transportationSummary.fromCampTotal}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Driving While at Camp</h2>

              <p>
                A driver is counted only on days when they are
                attending both breakfast and lunch.
              </p>
            </div>
          </div>

          {drivers.length === 0 ? (
            <div className="empty-state">
              <h3>No drivers registered</h3>

              <p>
                At-camp driving availability will appear here
                once drivers are registered.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="at-camp-driving-table">
                <thead>
                  <tr>
                    <th>Driver</th>

                    {AT_CAMP_DRIVING_DAYS.map((day) => (
                      <th key={day.date}>{day.date}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td>
                        <strong>
                          {driver.camper_first_name}{" "}
                          {driver.camper_last_name}
                        </strong>

                        {driver.family_name && (
                          <span className="driver-family-name">
                            {driver.family_name} Family
                          </span>
                        )}
                      </td>

                      {AT_CAMP_DRIVING_DAYS.map((day) => {
                        const isAvailable =
                          driverIsAvailableAtCampOnDay(
                            driver,
                            day
                          );

                        return (
                          <td key={day.date}>
                            {isAvailable ? (
                              <strong className="at-camp-seat-count">
                                {driver.empty_seats_during_camp ?? 0}
                              </strong>
                            ) : (
                              <span className="at-camp-unavailable">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th>Total Open Seats</th>

                    {transportationSummary.atCampDays.map(
                      (day) => (
                        <td key={day.date}>
                          <strong>{day.totalSeats}</strong>
                        </td>
                      )
                    )}
                  </tr>

                  <tr className="at-camp-driver-count-row">
                    <th>Drivers Present</th>

                    {transportationSummary.atCampDays.map(
                      (day) => (
                        <td key={day.date}>
                          {day.availableDrivers.length}
                        </td>
                      )
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

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