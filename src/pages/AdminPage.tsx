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

const SLDC_WAIVER_TEXT = `I know that running and volunteering to work at club races are potentially hazardous activities. I should not participate in club activities unless I am medically able and properly trained. I agree to abide by any decision of a race official relative to my ability to safely complete a run. I assume all risks associated with running and volunteering to work in club races including but not limited to falls, contact with other participants, the effects of the weather including high heat and humidity, the conditions of the road, traffic on the course, all such risks being known and appreciated by me. Having read this waiver and knowing these facts, and in consideration of acceptance of my application for membership, I, for myself and anyone entitled to act on my behalf, waive and release the Road Runners Club of America, the San Luis Distance Club, and their sponsors, their representatives, and their successors from all claims and liabilities of any kind arising out of my participation in club activities even though that liability may arise out of carelessness or negligence on the part of the persons named in this waiver.`;

const RRCA_CODE_OF_CONDUCT_TEXT = `Members will always show respect for other members and race volunteers. No member is to yell, taunt, or threaten another club member, volunteer, or event spectator. Members are not to use abusive or vulgar language or make racial, ethnic, or gender related slurs or derogatory comments at club events or make unwanted contact, physical or otherwise, with other members.`;


function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


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

type CampBirthday = {
  camper: Camper;
  month: number;
  day: number;
  displayDate: string;
};

/**
 * Supports the usual HTML date-input format (YYYY-MM-DD)
 * and MM/DD/YYYY in case older applications used that format.
 */
function parseBirthdayMonthDay(
  value: string | null | undefined
): { month: number; day: number } | null {
  const birthday = value?.trim();

  if (!birthday) {
    return null;
  }

  const isoMatch = birthday.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoMatch) {
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    return month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
      ? { month, day }
      : null;
  }

  const usMatch = birthday.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (usMatch) {
    const month = Number(usMatch[1]);
    const day = Number(usMatch[2]);

    return month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
      ? { month, day }
      : null;
  }

  return null;
}

/**
 * Camp runs July 26 through August 2.
 * Birth years do not matter here—only month and day.
 */
function birthdayFallsDuringCamp(
  month: number,
  day: number
): boolean {
  return (
    (month === 7 && day >= 26) ||
    (month === 8 && day <= 2)
  );
}

function formatCampBirthday(
  month: number,
  day: number
): string {
  return new Date(2026, month - 1, day).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
    }
  );
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

  function printSLDCWaiver(
      camper: Camper,
      application: SLDCApplication
    ) {
      const printWindow = window.open(
        "",
        "_blank",
        "width=900,height=1000"
      );

      if (!printWindow) {
        alert(
          "The print window was blocked. Please allow pop-ups for this website and try again."
        );
        return;
      }

      const camperName =
        `${camper.camper_first_name ?? ""} ${camper.camper_last_name ?? ""
          }`.trim();

      const signedDate = application.signed_at
        ? new Date(application.signed_at).toLocaleString()
        : "Not recorded";

      printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <title>
          SLDC Waiver - ${escapeHtml(camperName)}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            max-width: 850px;
            margin: 0 auto;
            padding: 36px;
            color: #111827;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
          }

          h1,
          h2,
          h3,
          p {
            margin-top: 0;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 24pt;
          }

          h2 {
            margin-top: 30px;
            padding-bottom: 6px;
            border-bottom: 2px solid #111827;
            font-size: 16pt;
          }

          h3 {
            margin-top: 20px;
            font-size: 13pt;
          }

          .subtitle {
            margin-bottom: 28px;
            color: #4b5563;
          }

          .information-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 24px;
          }

          .information-item {
            padding: 7px 0;
            border-bottom: 1px solid #d1d5db;
          }

          .information-item.full {
            grid-column: 1 / -1;
          }

          .label {
            display: block;
            margin-bottom: 2px;
            color: #4b5563;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
          }

          .agreement-box {
            margin-top: 14px;
            padding: 16px;
            border: 1px solid #9ca3af;
            border-radius: 6px;
          }

          .accepted {
            margin-top: 12px;
            font-weight: 700;
          }

          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 20px;
          }

          .signature-box {
            min-height: 80px;
            padding-top: 8px;
            border-top: 1px solid #111827;
          }

          .footer {
            margin-top: 36px;
            padding-top: 12px;
            border-top: 1px solid #d1d5db;
            color: #6b7280;
            font-size: 9pt;
          }

          .print-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
          }

          .print-actions button {
            padding: 9px 14px;
            border: 1px solid #9ca3af;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            font: inherit;
          }

          .print-actions .primary {
            color: white;
            background: #1d4ed8;
            border-color: #1d4ed8;
          }

          @media print {
            body {
              max-width: none;
              padding: 0;
            }

            .print-actions {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="print-actions">
          <button
            class="primary"
            onclick="window.print()"
          >
            Print
          </button>

          <button onclick="window.close()">
            Close
          </button>
        </div>

        <h1>San Luis Distance Club</h1>

        <p class="subtitle">
          Membership Application, Waiver, and Code of Conduct
        </p>

        <h2>Member Information</h2>

        <div class="information-grid">
          <div class="information-item">
            <span class="label">Name</span>
            ${escapeHtml(application.name || camperName)}
          </div>

          <div class="information-item">
            <span class="label">Birthdate</span>
            ${escapeHtml(application.birthdate || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Telephone</span>
            ${escapeHtml(application.telephone || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Email</span>
            ${escapeHtml(application.email || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">Mailing Address</span>
            ${escapeHtml(application.mailing_address || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">City / ZIP</span>
            ${escapeHtml(application.city_zip || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">
              Races or Additional Information
            </span>

            ${escapeHtml(
        [
          application.races_or_info_1,
          application.races_or_info_2,
          application.races_or_info_3,
        ]
          .filter(Boolean)
          .join(" — ") || "None provided"
      )}
          </div>
        </div>

        <h2>Waiver</h2>

        <div class="agreement-box">
          <p>${escapeHtml(SLDC_WAIVER_TEXT)}</p>

          <p class="accepted">
            ${application.waiver_accepted
          ? "✓ Waiver accepted"
          : "Waiver acceptance not recorded"
        }
          </p>
        </div>

        <h2>RRCA Code of Conduct</h2>

        <div class="agreement-box">
          <p>
            ${escapeHtml(RRCA_CODE_OF_CONDUCT_TEXT)}
          </p>

          <p class="accepted">
            ${application.code_of_conduct_accepted
          ? "✓ Code of Conduct accepted"
          : "Code of Conduct acceptance not recorded"
        }
          </p>
        </div>

        <h2>Signatures</h2>

        <div class="signature-grid">
          <div class="signature-box">
            <span class="label">
              Member Typed Signature
            </span>

            ${escapeHtml(
          application.signature_name || "Not provided"
        )}
          </div>

          <div class="signature-box">
            <span class="label">
              Parent / Guardian Typed Signature
            </span>

            ${escapeHtml(
          application.parent_signature_name ||
          "Not provided"
        )}
          </div>
        </div>

        <div class="information-item full">
          <span class="label">Signed At</span>
          ${escapeHtml(signedDate)}
        </div>

        <div class="footer">
          Application version:
          ${escapeHtml(
          application.application_version ||
          "Not recorded"
        )}

          <br />

          Camper record:
          ${escapeHtml(camperName)}
        </div>
      </body>
    </html>
  `);

      printWindow.document.close();
      printWindow.focus();
    }

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

  const campBirthdays = useMemo<CampBirthday[]>(() => {
  const campersById = new Map(
    campers.map((camper) => [camper.id, camper])
  );

  const birthdays: CampBirthday[] = [];

  applications.forEach((application) => {
    const camper = campersById.get(
      application.camper_id
    );

    const birthday = parseBirthdayMonthDay(
      application.birthdate
    );

    if (
      !camper ||
      !birthday ||
      !birthdayFallsDuringCamp(
        birthday.month,
        birthday.day
      )
    ) {
      return;
    }

    birthdays.push({
      camper,
      month: birthday.month,
      day: birthday.day,
      displayDate: formatCampBirthday(
        birthday.month,
        birthday.day
      ),
    });
  });

  return birthdays.sort((a, b) => {
    const dateComparison =
      a.month - b.month || a.day - b.day;

    if (dateComparison !== 0) {
      return dateComparison;
    }

    const lastNameComparison = (
      a.camper.camper_last_name ?? ""
    ).localeCompare(
      b.camper.camper_last_name ?? ""
    );

    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }

    return (
      a.camper.camper_first_name ?? ""
    ).localeCompare(
      b.camper.camper_first_name ?? ""
    );
  });
}, [applications, campers]);

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