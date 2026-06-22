
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
  type DietaryOptionKey,
  createEmptyDietarySelections,
  formatDietaryNeeds,
  parseDietaryNeeds,
} from "./utils/dietaryNeeds";

import type { Schema } from "../amplify/data/resource";
import type { Camper, CamperType, Size } from "./types";

import {
  type AttendanceSchedule,
  createFullAttendanceSchedule,
} from "./constants/campSchedule";

import HeroCard from "./components/HeroCard";
import AddCamperCard from "./components/AddCamperCard";
import JoinSLDC from "./components/JoinSLDC";
import SignCampWaiver from "./components/SignCampWaiver";
import PayCampFee from "./components/PayCampFee";
import CampInfo from "./components/CampInfo";

import "./App.css";

/* -------------------------------------------------------------------------- */
/*                              App Configuration                             */
/* -------------------------------------------------------------------------- */

/**
 * The application uses one shared settings record to determine whether
 * families see only the preliminary interest form or the full application.
 */
const APP_SETTINGS_ID = "camp-registration-settings";

const DEFAULT_CAMPER_TYPE: CamperType = "ATHLETE";
const DEFAULT_SIZE: Size = "M";

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether a camper type is permitted to submit transportation
 * information.
 *
 * Keeping this rule in one function prevents slightly different driver rules
 * from appearing in several places.
 */
function camperTypeCanDrive(camperType: CamperType): boolean {
  return (
    camperType === "COACH" ||
    camperType === "PARENT" ||
    camperType === "NON_PARENT_ADULT_ALUMNI"
  );
}

/**
 * Amplify JSON fields may come back as either a parsed object or a JSON string.
 * This converts either format into an AttendanceSchedule.
 */
function parseCamperAttendance(
  value: Camper["attendance_schedule"]
): AttendanceSchedule {
  if (!value) {
    return createFullAttendanceSchedule();
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AttendanceSchedule;
    } catch (error) {
      console.error("Could not parse camper attendance:", error);
      return createFullAttendanceSchedule();
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as AttendanceSchedule;
  }

  return createFullAttendanceSchedule();
}

/* -------------------------------------------------------------------------- */
/*                                    App                                     */
/* -------------------------------------------------------------------------- */

function App() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const { user, signOut } = useAuthenticator();

  /* ------------------------------------------------------------------------ */
  /*                          Application Stage State                         */
  /* ------------------------------------------------------------------------ */

  /**
   * false = preliminary interest form
   * true  = final/full application
   */
  const [isFinalPhase, setIsFinalPhase] = useState(false);

  const [
    applicationSettingsLoaded,
    setApplicationSettingsLoaded,
  ] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                           Family and Camper Data                         */
  /* ------------------------------------------------------------------------ */

  const [campers, setCampers] = useState<Camper[]>([]);
  const [familyName, setFamilyName] = useState("");

  /* ------------------------------------------------------------------------ */
  /*                             Camper Form State                            */
  /* ------------------------------------------------------------------------ */

  const [camperFirstName, setCamperFirstName] = useState("");
  const [camperLastName, setCamperLastName] = useState("");

  const [camperType, setCamperType] =
    useState<CamperType>(DEFAULT_CAMPER_TYPE);

  const [shirtSize, setShirtSize] =
    useState<Size>(DEFAULT_SIZE);

  const [sweatshirtSize, setSweatshirtSize] =
    useState<Size>(DEFAULT_SIZE);

  const [dietarySelections, setDietarySelections] = useState(
  () => createEmptyDietarySelections()
);

const [otherDietaryNeeds, setOtherDietaryNeeds] = useState("");

  const [attendingFullCamp, setAttendingFullCamp] =
    useState(true);

  const [
    attendanceSchedule,
    setAttendanceSchedule,
  ] = useState<AttendanceSchedule>(() =>
    createFullAttendanceSchedule()
  );

  /* ------------------------------------------------------------------------ */
  /*                          Transportation Form State                       */
  /* ------------------------------------------------------------------------ */

  const [isDriver, setIsDriver] = useState(false);
  const [emptySeatsToCamp, setEmptySeatsToCamp] = useState(0);
  const [emptySeatsFromCamp, setEmptySeatsFromCamp] =
    useState(0);
  const [emptySeatsDuringCamp, setEmptySeatsDuringCamp] =
    useState(0);

  /* ------------------------------------------------------------------------ */
  /*                           Form and Section State                         */
  /* ------------------------------------------------------------------------ */

  const [showAddCamper, setShowAddCamper] = useState(false);

  /**
   * When this is null, the form creates a new camper.
   * When it contains an ID, the form updates that camper.
   */
  const [editingCamperId, setEditingCamperId] =
    useState<string | null>(null);

  const [showJoinSLDC, setShowJoinSLDC] = useState(false);

  const [
    showSignCampWaiver,
    setShowSignCampWaiver,
  ] = useState(false);

  const [showPayCampFee, setShowPayCampFee] =
    useState(false);

  const [showCampInfo, setShowCampInfo] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                              Derived Values                              */
  /* ------------------------------------------------------------------------ */

  const canBeDriver = camperTypeCanDrive(camperType);

  /* ------------------------------------------------------------------------ */
  /*                        Application Settings Effect                       */
  /* ------------------------------------------------------------------------ */

  /**
   * Listen for preliminary/final stage changes.
   *
   * Using observeQuery allows the family page to update when an administrator
   * changes the application stage.
   */


  function toggleDietaryOption(option: DietaryOptionKey) {
  setDietarySelections((current) => ({
    ...current,
    [option]: !current[option],
  }));
}

  useEffect(() => {
    const subscription =
      client.models.AppSettings.observeQuery({
        filter: {
          id: {
            eq: APP_SETTINGS_ID,
          },
        },
        authMode: "userPool",
      }).subscribe({
        next: ({ items, isSynced }) => {
          const settings = items[0];

          // No settings record means preliminary mode.
          setIsFinalPhase(settings?.is_final === true);

          if (isSynced) {
            setApplicationSettingsLoaded(true);
          }
        },

        error: (error) => {
          console.error(
            "App settings subscription error:",
            error
          );

          // Fail safely into preliminary mode.
          setIsFinalPhase(false);
          setApplicationSettingsLoaded(true);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  /* ------------------------------------------------------------------------ */
  /*                         Current User Information                         */
  /* ------------------------------------------------------------------------ */

  /**
   * Load the family name from Cognito.
   */
  useEffect(() => {
    async function loadUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();

        setFamilyName(attributes.family_name ?? "");
      } catch (error) {
        console.error(
          "Error fetching user attributes:",
          error
        );
      }
    }

    loadUserAttributes();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                           Family Camper Records                          */
  /* ------------------------------------------------------------------------ */

  /**
   * Subscribe only to campers owned by the currently signed-in account.
   *
   * The explicit owner filter is especially important when an administrator
   * visits the regular family page because admins are otherwise authorized to
   * read all camper records.
   */
  useEffect(() => {
    const currentUserSub = user?.userId;

    if (!currentUserSub) {
      setCampers([]);
      return;
    }

    const subscription =
      client.models.Camper.observeQuery({
        filter: {
          owner: {
            beginsWith: `${currentUserSub}::`,
          },
        },
        authMode: "userPool",
      }).subscribe({
        next: ({ items }) => {
          setCampers([...items]);
        },

        error: (error) => {
          console.error(
            "Family camper query error:",
            error
          );

          setCampers([]);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, user?.userId]);

  /**
   * Older camper records may not contain family_name.
   * Backfill it from the signed-in user's Cognito profile.
   */
  useEffect(() => {
    const normalizedFamilyName = familyName.trim();

    if (!normalizedFamilyName || campers.length === 0) {
      return;
    }

    const campersMissingFamilyName = campers.filter(
      (camper) => !camper.family_name
    );

    if (campersMissingFamilyName.length === 0) {
      return;
    }

    Promise.all(
      campersMissingFamilyName.map((camper) =>
        client.models.Camper.update({
          id: camper.id,
          family_name: normalizedFamilyName,
        })
      )
    ).catch((error) => {
      console.error(
        "Could not backfill family name:",
        error
      );
    });
  }, [campers, client, familyName]);

  /* ------------------------------------------------------------------------ */
  /*                           Camper Form Helpers                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Restore the camper form to its default state and close it.
   */
  function resetCamperForm() {
    setCamperFirstName("");
    setCamperLastName("");
    setCamperType(DEFAULT_CAMPER_TYPE);
    setShirtSize(DEFAULT_SIZE);
    setSweatshirtSize(DEFAULT_SIZE);
    setDietarySelections(createEmptyDietarySelections());
setOtherDietaryNeeds("");

    setAttendingFullCamp(true);
    setAttendanceSchedule(
      createFullAttendanceSchedule()
    );

    setIsDriver(false);
    setEmptySeatsToCamp(0);
    setEmptySeatsFromCamp(0);
    setEmptySeatsDuringCamp(0);

    setEditingCamperId(null);
    setShowAddCamper(false);
  }

  /**
   * Load an existing camper into the form.
   */
  function editCamper(camper: Camper) {
    const savedCamperType =
      (camper.camper_type ??
        DEFAULT_CAMPER_TYPE) as CamperType;

    const savedCamperCanDrive =
      camperTypeCanDrive(savedCamperType);

    const isFullCamp =
      camper.attending_full_camp ?? true;

    setEditingCamperId(camper.id);

    setCamperFirstName(
      camper.camper_first_name ?? ""
    );

    setCamperLastName(
      camper.camper_last_name ?? ""
    );

    setCamperType(savedCamperType);

    setShirtSize(
      (camper.shirt_size ?? DEFAULT_SIZE) as Size
    );

    setSweatshirtSize(
      (camper.sweatshirt_size ??
        DEFAULT_SIZE) as Size
    );

    const savedDietaryNeeds = parseDietaryNeeds(
  camper.special_dietary_needs
);

setDietarySelections(savedDietaryNeeds.selections);
setOtherDietaryNeeds(
  savedDietaryNeeds.otherDietaryNeeds
);

    setAttendingFullCamp(isFullCamp);

    setAttendanceSchedule(
      isFullCamp
        ? createFullAttendanceSchedule()
        : parseCamperAttendance(
            camper.attendance_schedule
          )
    );

    setIsDriver(
      savedCamperCanDrive &&
        (camper.is_driver ?? false)
    );

    setEmptySeatsToCamp(
      savedCamperCanDrive
        ? camper.empty_seats_to_camp ?? 0
        : 0
    );

    setEmptySeatsFromCamp(
      savedCamperCanDrive
        ? camper.empty_seats_from_camp ?? 0
        : 0
    );

    setEmptySeatsDuringCamp(
      savedCamperCanDrive
        ? camper.empty_seats_during_camp ?? 0
        : 0
    );

    setShowAddCamper(true);

    // Move the user back to the form after clicking Edit.
    requestAnimationFrame(() => {
      document
        .getElementById("camper-form-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  /**
   * Update the selected camper type and clear transportation information
   * when the new type is not permitted to drive.
   */
  function handleCamperTypeChange(
    newType: CamperType
  ) {
    setCamperType(newType);

    if (!camperTypeCanDrive(newType)) {
      setIsDriver(false);
      setEmptySeatsToCamp(0);
      setEmptySeatsFromCamp(0);
      setEmptySeatsDuringCamp(0);
    }
  }

  /**
   * Set whether the camper attends the full camp.
   *
   * Full-camp attendance automatically enables every meal.
   */
  function handleFullCampChange(
    isFullCamp: boolean
  ) {
    setAttendingFullCamp(isFullCamp);

    if (isFullCamp) {
      setAttendanceSchedule(
        createFullAttendanceSchedule()
      );
    }
  }

  /**
   * Toggle one meal in a partial attendance schedule.
   */
  function toggleAttendanceMeal(mealId: string) {
    setAttendanceSchedule((current) => ({
      ...current,
      [mealId]: !current[mealId],
    }));
  }

  /* ------------------------------------------------------------------------ */
  /*                           Camper CRUD Actions                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Create a new camper or update the camper currently being edited.
   */
  async function saveCamper(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const firstName = camperFirstName.trim();
    const lastName = camperLastName.trim();
    const isEditing = editingCamperId !== null;
    const camperIdBeingEdited = editingCamperId;

    if (!firstName || !lastName) {
      alert(
        "Please enter the camper's first and last name."
      );

      return;
    }

    /**
     * These are the fields families are allowed to create or update.
     * Administrator-only status fields are intentionally omitted.
     */
    const camperData = {
      camper_first_name: firstName,
      camper_last_name: lastName,
      camper_type: camperType,
      shirt_size: shirtSize,
      sweatshirt_size: sweatshirtSize,

      // Using null allows an existing value to be cleared during editing.
      special_dietary_needs:
  formatDietaryNeeds(
    dietarySelections,
    otherDietaryNeeds
  ) || null,

      attending_full_camp: attendingFullCamp,

      attendance_schedule: JSON.stringify(
        attendingFullCamp
          ? createFullAttendanceSchedule()
          : attendanceSchedule
      ),

      is_driver: canBeDriver ? isDriver : false,

      empty_seats_to_camp:
        canBeDriver && isDriver
          ? emptySeatsToCamp
          : 0,

      empty_seats_from_camp:
        canBeDriver && isDriver
          ? emptySeatsFromCamp
          : 0,

      empty_seats_during_camp:
        canBeDriver && isDriver
          ? emptySeatsDuringCamp
          : 0,
    };

    try {
      const result =
        isEditing && camperIdBeingEdited
          ? await client.models.Camper.update({
              id: camperIdBeingEdited,
              ...camperData,
            })
          : await client.models.Camper.create({
              ...camperData,
              family_name:
                familyName.trim() || undefined,
            });

      if (result.errors?.length) {
        console.error(
          isEditing
            ? "Camper update errors:"
            : "Camper create errors:",
          result.errors
        );

        alert(
          isEditing
            ? "There was a problem updating this camper."
            : "There was a problem saving this camper."
        );

        return;
      }

      console.log(
        isEditing
          ? "Camper updated successfully:"
          : "Camper created successfully:",
        result.data
      );

      /**
       * Update React state immediately so the registered camper table changes
       * without requiring a browser refresh.
       */
      if (isEditing && camperIdBeingEdited) {
        setCampers((currentCampers) =>
          currentCampers.map((camper) =>
            camper.id === camperIdBeingEdited
              ? ({
                  ...camper,
                  ...camperData,
                } as Camper)
              : camper
          )
        );
      } else if (result.data) {
        setCampers((currentCampers) => {
          const alreadyExists =
            currentCampers.some(
              (camper) =>
                camper.id === result.data?.id
            );

          return alreadyExists
            ? currentCampers
            : [
                ...currentCampers,
                result.data as Camper,
              ];
        });
      }

      resetCamperForm();
    } catch (error) {
      console.error(
        isEditing
          ? "Unexpected camper update error:"
          : "Unexpected camper create error:",
        error
      );

      alert(
        isEditing
          ? "Unexpected error updating camper."
          : "Unexpected error saving camper."
      );
    }
  }

  /**
   * Delete a camper and immediately remove it from the visible table.
   */
  async function deleteCamper(id: string) {
    try {
      const { errors } =
        await client.models.Camper.delete({ id });

      if (errors?.length) {
        console.error(
          "Camper delete errors:",
          errors
        );

        alert(
          "There was a problem deleting this camper."
        );

        return;
      }

      setCampers((currentCampers) =>
        currentCampers.filter(
          (camper) => camper.id !== id
        )
      );

      if (editingCamperId === id) {
        resetCamperForm();
      }
    } catch (error) {
      console.error(
        "Unexpected error deleting camper:",
        error
      );

      alert(
        "Unexpected error deleting camper."
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="app-shell">
      <HeroCard
        email={user?.signInDetails?.loginId}
        familyName={familyName}
        onSignOut={signOut}
      />

      {!applicationSettingsLoaded ? (
        <section className="card">
          <p>Loading camp application…</p>
        </section>
      ) : (
        <>
          {/* Preliminary mode explanatory message */}
          {!isFinalPhase && (
            <section className="card preliminary-interest-card">
              <div className="preliminary-interest-icon">
                i
              </div>

              <div>
                <p className="eyebrow">
                  Preliminary Registration
                </p>

                <h2>Camp Interest Form</h2>

                <p>
                  This is an interest form only. The camp
                  team has not yet been selected, and
                  participation will depend in part on
                  summer training.
                </p>

                <p>
                  If your camper is interested in and
                  available for camp this year, please
                  add them below. Camp selections are
                  expected to be announced during the
                  first half of July.
                </p>

                <p className="preliminary-interest-note">
                  Submitting this form indicates interest
                  and availability but does not guarantee
                  selection for camp.
                </p>
              </div>
            </section>
          )}

          {/* Step 1 remains visible during both stages */}
          <AddCamperCard
            campers={campers}
            editCamper={editCamper}
            deleteCamper={deleteCamper}
            editingCamperId={editingCamperId}
            resetCamperForm={resetCamperForm}
            showAddCamper={showAddCamper}
            setShowAddCamper={setShowAddCamper}
            saveCamper={saveCamper}
            camperFirstName={camperFirstName}
            setCamperFirstName={
              setCamperFirstName
            }
            camperLastName={camperLastName}
            setCamperLastName={
              setCamperLastName
            }
            camperType={camperType}
            handleCamperTypeChange={
              handleCamperTypeChange
            }
            shirtSize={shirtSize}
            setShirtSize={setShirtSize}
            sweatshirtSize={sweatshirtSize}
            setSweatshirtSize={
              setSweatshirtSize
            }
           dietarySelections={dietarySelections}
toggleDietaryOption={toggleDietaryOption}
otherDietaryNeeds={otherDietaryNeeds}
setOtherDietaryNeeds={setOtherDietaryNeeds}
            canBeDriver={canBeDriver}
            isDriver={isDriver}
            setIsDriver={setIsDriver}
            emptySeatsToCamp={emptySeatsToCamp}
            setEmptySeatsToCamp={
              setEmptySeatsToCamp
            }
            emptySeatsFromCamp={
              emptySeatsFromCamp
            }
            setEmptySeatsFromCamp={
              setEmptySeatsFromCamp
            }
            emptySeatsDuringCamp={
              emptySeatsDuringCamp
            }
            setEmptySeatsDuringCamp={
              setEmptySeatsDuringCamp
            }
            attendingFullCamp={attendingFullCamp}
            handleFullCampChange={
              handleFullCampChange
            }
            attendanceSchedule={
              attendanceSchedule
            }
            toggleAttendanceMeal={
              toggleAttendanceMeal
            }
          />

          {/* Steps 2–5 are shown only during final application mode */}
          {isFinalPhase && (
            <>
              <JoinSLDC
                campers={campers}
                showJoinSLDC={showJoinSLDC}
                setShowJoinSLDC={setShowJoinSLDC}
              />

              <SignCampWaiver
                campers={campers}
                showSignCampWaiver={
                  showSignCampWaiver
                }
                setShowSignCampWaiver={
                  setShowSignCampWaiver
                }
              />

              <PayCampFee
                campers={campers}
                familyName={familyName}
                showPayCampFee={showPayCampFee}
                setShowPayCampFee={
                  setShowPayCampFee
                }
              />

              <CampInfo
                showCampInfo={showCampInfo}
                setShowCampInfo={setShowCampInfo}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;
