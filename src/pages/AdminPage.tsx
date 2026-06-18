import { Fragment, useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import {
  CAMP_DAYS,
  CAMP_MEALS,
  type AttendanceSchedule,
} from "../constants/campSchedule";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];
type CamperStatusUpdate = {
  isSLDCmember?: boolean;
  isSLDCfee?: boolean;
  isCampAccept?: boolean;
  isCampFee?: boolean;
  isCampWaiver?: boolean;
};

type FamilyStatusField =
  | "isSLDCfee"
  | "isCampAccept"
  | "isCampFee";

type FamilyGroup = {
  key: string;
  name: string;
  campers: Camper[];
};

const APP_SETTINGS_ID =
  "camp-registration-settings";

function parseAttendanceSchedule(
  value: Camper["attendance_schedule"]
): AttendanceSchedule | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AttendanceSchedule;
    } catch (error) {
      console.error(
        "Could not parse camper attendance schedule:",
        error
      );

      return null;
    }
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as AttendanceSchedule;
  }

  return null;
}


function AdminPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const { user, signOut } = useAuthenticator();

  const [campers, setCampers] = useState<Camper[]>([]);
  const [applications, setApplications] = useState<SLDCApplication[]>([]);
  const [isFinalPhase, setIsFinalPhase] =
    useState(false);

  const [settingsLoaded, setSettingsLoaded] =
    useState(false);

  const [isSavingPhase, setIsSavingPhase] =
    useState(false);

  const mealSummary = useMemo(() => {
    const totals: Record<string, number> = {};

    CAMP_MEALS.forEach((meal) => {
      totals[meal.id] = 0;
    });



    let incompleteAttendanceRecords = 0;



    campers.forEach((camper) => {
      // Full-camp campers attend every scheduled meal.
      if (camper.attending_full_camp === true) {
        CAMP_MEALS.forEach((meal) => {
          totals[meal.id] += 1;
        });

        return;
      }



      const schedule = parseAttendanceSchedule(
        camper.attendance_schedule
      );

      if (!schedule) {
        incompleteAttendanceRecords += 1;
        return;
      }

      CAMP_MEALS.forEach((meal) => {
        if (schedule[meal.id] === true) {
          totals[meal.id] += 1;
        }
      });
    });

    return {
      totals,
      incompleteAttendanceRecords,
    };
  }, [campers]);

  const transportationSummary = useMemo(() => {
    const drivers = campers
      .filter((camper) => camper.is_driver === true)
      .sort((a, b) => {
        const lastNameComparison = (
          a.camper_last_name ?? ""
        ).localeCompare(b.camper_last_name ?? "");

        if (lastNameComparison !== 0) {
          return lastNameComparison;
        }

        return (a.camper_first_name ?? "").localeCompare(
          b.camper_first_name ?? ""
        );
      });

    const totals = drivers.reduce(
      (currentTotals, driver) => ({
        toCamp:
          currentTotals.toCamp +
          Math.max(0, driver.empty_seats_to_camp ?? 0),

        fromCamp:
          currentTotals.fromCamp +
          Math.max(0, driver.empty_seats_from_camp ?? 0),

        duringCamp:
          currentTotals.duringCamp +
          Math.max(0, driver.empty_seats_during_camp ?? 0),
      }),
      {
        toCamp: 0,
        fromCamp: 0,
        duringCamp: 0,
      }
    );

    return {
      drivers,
      totals,
    };
  }, [campers]);

  const familyGroups = useMemo<FamilyGroup[]>(() => {
    const groups = new Map<string, FamilyGroup>();

    campers.forEach((camper) => {
      /*
       * Use owner as the true grouping key. It identifies the
       * authenticated account that created the camper.
       *
       * The fallback handles legacy records if owner is unavailable.
       */
      const familyKey =
        camper.owner ??
        camper.family_name ??
        camper.camper_last_name ??
        camper.id;

      const rawFamilyName =
        camper.family_name?.trim() ||
        camper.camper_last_name?.trim() ||
        "Unknown";

      const displayName = rawFamilyName
        .toLowerCase()
        .endsWith("family")
        ? rawFamilyName
        : `${rawFamilyName} Family`;

      const existingGroup = groups.get(familyKey);

      if (existingGroup) {
        existingGroup.campers.push(camper);
      } else {
        groups.set(familyKey, {
          key: familyKey,
          name: displayName,
          campers: [camper],
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [campers]);

  useEffect(() => {
    let cancelled = false;

    async function loadAppSettings() {
      try {
        const { data, errors } =
          await client.models.AppSettings.get(
            {
              id: APP_SETTINGS_ID,
            },
            {
              authMode: "userPool",
            }
          );

        if (errors?.length) {
          console.error(
            "App settings query errors:",
            errors
          );
        }

        if (cancelled) {
          return;
        }

        if (data) {
          setIsFinalPhase(data.is_final ?? false);
          setSettingsLoaded(true);
          return;
        }

        /*
         * The record does not exist yet.
         * Create it in preliminary mode.
         */
        const createResult =
          await client.models.AppSettings.create(
            {
              id: APP_SETTINGS_ID,
              is_final: false,
            },
            {
              authMode: "userPool",
            }
          );

        if (createResult.errors?.length) {
          console.error(
            "App settings create errors:",
            createResult.errors
          );

          return;
        }

        if (!cancelled) {
          setIsFinalPhase(
            createResult.data?.is_final ?? false
          );

          setSettingsLoaded(true);
        }
      } catch (error) {
        console.error(
          "Could not load app settings:",
          error
        );
      }
    }

    loadAppSettings();

    return () => {
      cancelled = true;
    };
  }, [client]);

  async function changeApplicationPhase(
    nextIsFinal: boolean
  ) {
    const previousValue = isFinalPhase;

    setIsFinalPhase(nextIsFinal);
    setIsSavingPhase(true);

    try {
      const { data, errors } =
        await client.models.AppSettings.update(
          {
            id: APP_SETTINGS_ID,
            is_final: nextIsFinal,
          },
          {
            authMode: "userPool",
          }
        );

      if (errors?.length) {
        console.error(
          "Application phase update errors:",
          errors
        );

        setIsFinalPhase(previousValue);

        alert(
          "There was a problem changing the application phase."
        );

        return;
      }

      setIsFinalPhase(data?.is_final ?? nextIsFinal);
    } catch (error) {
      console.error(
        "Unexpected application phase update error:",
        error
      );

      setIsFinalPhase(previousValue);

      alert(
        "Unexpected error changing the application phase."
      );
    } finally {
      setIsSavingPhase(false);
    }
  }

  function isFamilyStatusChecked(
    familyCampers: Camper[],
    field: FamilyStatusField
  ) {
    return (
      familyCampers.length > 0 &&
      familyCampers.every((camper) => camper[field] === true)
    );
  }

  async function updateFamilyStatus(
    familyCampers: Camper[],
    field: FamilyStatusField,
    checked: boolean
  ) {
    let updates: CamperStatusUpdate;

    switch (field) {
      case "isSLDCfee":
        updates = {
          isSLDCfee: checked,
        };
        break;

      case "isCampAccept":
        updates = {
          isCampAccept: checked,
        };
        break;

      case "isCampFee":
        updates = {
          isCampFee: checked,
        };
        break;
    }

    await Promise.all(
      familyCampers.map((camper) =>
        updateCamperStatus(camper.id, updates)
      )
    );
  }

  async function updateCamperStatus(
    camperId: string,
    updates: CamperStatusUpdate
  ) {
    const originalCamper = campers.find((camper) => camper.id === camperId);

    if (!originalCamper) {
      return;
    }

    // Update the checkbox immediately
    setCampers((currentCampers) =>
      currentCampers.map((camper) =>
        camper.id === camperId
          ? ({ ...camper, ...updates } as Camper)
          : camper
      )
    );

    try {
      const { data, errors } = await client.models.Camper.update({
        id: camperId,
        ...updates,
      });

      if (errors?.length) {
        console.error("Camper status update errors:", errors);

        // Roll back the checkbox
        setCampers((currentCampers) =>
          currentCampers.map((camper) =>
            camper.id === camperId ? originalCamper : camper
          )
        );

        alert("There was a problem updating the camper status.");
        return;
      }

      console.log("Camper status updated:", data);

      if (data) {
        setCampers((currentCampers) =>
          currentCampers.map((camper) =>
            camper.id === camperId
              ? ({ ...camper, ...updates } as Camper)
              : camper
          )
        );
      }
    } catch (error) {
      console.error("Unexpected camper status update error:", error);

      // Roll back the checkbox
      setCampers((currentCampers) =>
        currentCampers.map((camper) =>
          camper.id === camperId ? originalCamper : camper
        )
      );

      alert("Unexpected error updating camper status.");
    }
  }

  useEffect(() => {
    const camperSubscription =
      client.models.Camper.observeQuery().subscribe({
        next: ({ items, isSynced }) => {
          console.log("Camper observer:", {
            isSynced,
            campers: items.map((camper) => ({
              id: camper.id,
              isSLDCmember: camper.isSLDCmember,
              isSLDCfee: camper.isSLDCfee,
              isCampAccept: camper.isCampAccept,
              isCampFee: camper.isCampFee,
              isCampWaiver: camper.isCampWaiver,
            })),
          });

          // Do not overwrite the optimistic checkbox state
          // with an earlier local snapshot.
          if (!isSynced) {
            return;
          }

          setCampers([...items]);
        },

        error: (error) => {
          console.error("Admin camper query error:", error);
        },
      });

    const applicationSubscription =
      client.models.SLDCApplication.observeQuery().subscribe({
        next: ({ items }) => {
          setApplications([...items]);
        },
        error: (error) => {
          console.error("Admin SLDC query error:", error);
        },
      });

    return () => {
      camperSubscription.unsubscribe();
      applicationSubscription.unsubscribe();
    };
  }, [client]);

  function camperHasSLDCApplication(camperId: string) {
    return applications.some(
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
              <h2>Camp Drivers</h2>
              <p>
                Available passenger spaces offered by each driver
              </p>
            </div>
          </div>

          {transportationSummary.drivers.length === 0 ? (
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
                    <th>At Camp</th>
                  </tr>
                </thead>

                <tbody>
                  {transportationSummary.drivers.map((driver) => (
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

                      <td>
                        {driver.empty_seats_during_camp ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th>Total Open Seats</th>

                    <td>
                      <strong>
                        {transportationSummary.totals.toCamp}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {transportationSummary.totals.fromCamp}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {transportationSummary.totals.duringCamp}
                      </strong>
                    </td>
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
                          {camperHasSLDCApplication(camper.id)
                            ? "Submitted"
                            : "Not submitted"}
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