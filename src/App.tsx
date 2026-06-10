import { FormEvent, useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import "./App.css";

const client = generateClient<Schema>();


type Camper = Schema["Camper"]["type"];

type CamperType =
  | "ATHLETE"
  | "PARENT"
  | "NON_PARENT_ADULT_ALUMNI"
  | "SIBLING"
  | "COACH";
type Size = "XS" | "S" | "M" | "L" | "XL";

const CAMP_MEALS = [
  { id: "2026-07-26_DINNER", date: "July 26", meal: "Dinner" },

  { id: "2026-07-27_BREAKFAST", date: "July 27", meal: "Breakfast" },
  { id: "2026-07-27_LUNCH", date: "July 27", meal: "Lunch" },
  { id: "2026-07-27_DINNER", date: "July 27", meal: "Dinner" },

  { id: "2026-07-28_BREAKFAST", date: "July 28", meal: "Breakfast" },
  { id: "2026-07-28_LUNCH", date: "July 28", meal: "Lunch" },
  { id: "2026-07-28_DINNER", date: "July 28", meal: "Dinner" },

  { id: "2026-07-29_BREAKFAST", date: "July 29", meal: "Breakfast" },
  { id: "2026-07-29_LUNCH", date: "July 29", meal: "Lunch" },
  { id: "2026-07-29_DINNER", date: "July 29", meal: "Dinner" },

  { id: "2026-07-30_BREAKFAST", date: "July 30", meal: "Breakfast" },
  { id: "2026-07-30_LUNCH", date: "July 30", meal: "Lunch" },
  { id: "2026-07-30_DINNER", date: "July 30", meal: "Dinner" },

  { id: "2026-07-31_BREAKFAST", date: "July 31", meal: "Breakfast" },
  { id: "2026-07-31_LUNCH", date: "July 31", meal: "Lunch" },
  { id: "2026-07-31_DINNER", date: "July 31", meal: "Dinner" },

  { id: "2026-08-01_BREAKFAST", date: "Aug 1", meal: "Breakfast" },
  { id: "2026-08-01_LUNCH", date: "Aug 1", meal: "Lunch" },
  { id: "2026-08-01_DINNER", date: "Aug 1", meal: "Dinner" },

  { id: "2026-08-02_BREAKFAST", date: "Aug 2", meal: "Breakfast" },
];

type AttendanceSchedule = Record<string, boolean>;

type CampMealCell = {
  id: string;
  label: "Breakfast" | "Lunch" | "Dinner";
} | null;

const CAMP_DAYS: Array<{
  date: string;
  meals: CampMealCell[];
}> = [
    {
      date: "July 26",
      meals: [
        null,
        null,
        { id: "2026-07-26_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "July 27",
      meals: [
        { id: "2026-07-27_BREAKFAST", label: "Breakfast" },
        { id: "2026-07-27_LUNCH", label: "Lunch" },
        { id: "2026-07-27_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "July 28",
      meals: [
        { id: "2026-07-28_BREAKFAST", label: "Breakfast" },
        { id: "2026-07-28_LUNCH", label: "Lunch" },
        { id: "2026-07-28_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "July 29",
      meals: [
        { id: "2026-07-29_BREAKFAST", label: "Breakfast" },
        { id: "2026-07-29_LUNCH", label: "Lunch" },
        { id: "2026-07-29_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "July 30",
      meals: [
        { id: "2026-07-30_BREAKFAST", label: "Breakfast" },
        { id: "2026-07-30_LUNCH", label: "Lunch" },
        { id: "2026-07-30_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "July 31",
      meals: [
        { id: "2026-07-31_BREAKFAST", label: "Breakfast" },
        { id: "2026-07-31_LUNCH", label: "Lunch" },
        { id: "2026-07-31_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "Aug 1",
      meals: [
        { id: "2026-08-01_BREAKFAST", label: "Breakfast" },
        { id: "2026-08-01_LUNCH", label: "Lunch" },
        { id: "2026-08-01_DINNER", label: "Dinner" },
      ],
    },
    {
      date: "Aug 2",
      meals: [
        { id: "2026-08-02_BREAKFAST", label: "Breakfast" },
        null,
        null,
      ],
    },
  ];

function createFullAttendanceSchedule(): AttendanceSchedule {
  return CAMP_MEALS.reduce((schedule, meal) => {
    schedule[meal.id] = true;
    return schedule;
  }, {} as AttendanceSchedule);
}

function App() {
  const { user, signOut } = useAuthenticator();

  const [campers, setCampers] = useState<Camper[]>([]);
  const [familyName, setFamilyName] = useState<string>("");

  const [camperFirstName, setCamperFirstName] = useState("");
  const [camperLastName, setCamperLastName] = useState("");
  const [camperType, setCamperType] = useState<CamperType>("ATHLETE");
  const [shirtSize, setShirtSize] = useState<Size>("M");
  const [sweatshirtSize, setSweatshirtSize] = useState<Size>("M");
  const [specialDietaryNeeds, setSpecialDietaryNeeds] = useState("");
  const [showAddCamper, setShowAddCamper] = useState(false);

  const [attendingFullCamp, setAttendingFullCamp] = useState(true);
  const [attendanceSchedule, setAttendanceSchedule] =
    useState<AttendanceSchedule>(createFullAttendanceSchedule());

  useEffect(() => {
    async function loadUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();
        setFamilyName(attributes.family_name ?? "");
      } catch (error) {
        console.error("Error fetching user attributes:", error);
      }
    }

    loadUserAttributes();
  }, []);

  useEffect(() => {
    const sub = client.models.Camper.observeQuery().subscribe({
      next: ({ items }) => {
        setCampers([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  async function createCamper(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!camperFirstName.trim() || !camperLastName.trim()) {
      alert("Please enter the camper's first and last name.");
      return;
    }

    try {
      await client.models.Camper.create({
        camper_first_name: camperFirstName.trim(),
        camper_last_name: camperLastName.trim(),
        camper_type: camperType,
        shirt_size: shirtSize,
        sweatshirt_size: sweatshirtSize,
        special_dietary_needs: specialDietaryNeeds.trim() || undefined,
        attending_full_camp: attendingFullCamp,
        attendance_schedule: attendingFullCamp
          ? createFullAttendanceSchedule()
          : attendanceSchedule,
      });


      setCamperFirstName("");
      setCamperLastName("");
      setCamperType("ATHLETE");
      setShirtSize("M");
      setSweatshirtSize("M");
      setSpecialDietaryNeeds("");
      setShowAddCamper(false);
      setAttendingFullCamp(true);
      setAttendanceSchedule(createFullAttendanceSchedule());
    } catch (error) {
      console.error("Error creating camper:", error);
    }
  }

  async function deleteCamper(id: string) {
    try {
      await client.models.Camper.delete({ id });
    } catch (error) {
      console.error("Error deleting camper:", error);
    }
  }

  function formatCamperType(type: Camper["camper_type"]) {
    switch (type) {
      case "ATHLETE":
        return "Athlete";
      case "PARENT":
        return "Parent";
      case "NON_PARENT_ADULT_ALUMNI":
        return "Non-parent Adult/Alumni";
      case "SIBLING":
        return "Sibling";
      case "COACH":
        return "Coach";
      default:
        return "Not selected";
    }
  }

  function getCamperFee(camper: Camper) {
    switch (camper.camper_type) {
      case "ATHLETE":
        return 525;
      case "PARENT":
        return 0;
      case "NON_PARENT_ADULT_ALUMNI":
        return 100;
      case "SIBLING":
        return 50;
      case "COACH":
        return 0;
      default:
        return 0;
    }
  }

  const totalFee = campers.reduce((sum, camper) => {
    return sum + getCamperFee(camper);
  }, 0);

  const athleteCount = campers.filter(
    (camper) => camper.camper_type === "ATHLETE"
  ).length;

  const parentCount = campers.filter(
    (camper) => camper.camper_type === "PARENT"
  ).length;

  const adultAlumniCount = campers.filter(
    (camper) => camper.camper_type === "NON_PARENT_ADULT_ALUMNI"
  ).length;

  const siblingCount = campers.filter(
    (camper) => camper.camper_type === "SIBLING"
  ).length;

  const coachCount = campers.filter(
    (camper) => camper.camper_type === "COACH"
  ).length;



  function toggleAttendanceMeal(mealId: string) {
    setAttendanceSchedule((current) => ({
      ...current,
      [mealId]: !current[mealId],
    }));
  }

  function handleFullCampChange(isFullCamp: boolean) {
    setAttendingFullCamp(isFullCamp);

    if (isFullCamp) {
      setAttendanceSchedule(createFullAttendanceSchedule());
    }
  }

  function getAttendanceSummary(camper: Camper) {
    if (camper.attending_full_camp) {
      return "Full camp";
    }

    const schedule = camper.attendance_schedule as AttendanceSchedule | null;

    if (!schedule) {
      return "Partial camp";
    }

    const attendingCount = CAMP_MEALS.filter((meal) => schedule[meal.id]).length;

    return `Partial camp — ${attendingCount} of ${CAMP_MEALS.length} meals`;
  }

  return (
    <main className="app-shell">

      <section className="hero-card">
        <div>
          <p className="eyebrow">Sequoias Camp</p>
          <h1>My Application</h1>
          <p className="subtitle">
            Add campers, shirt sizes, sweatshirt sizes, and dietary needs.
          </p>
        </div>

        <div className="account-box">
          <p className="account-label">Signed in as</p>
          <p className="account-email">{user?.signInDetails?.loginId}</p>

          {familyName && (
            <p className="family-name">
              Family: <strong>{familyName}</strong>
            </p>
          )}

          <button className="secondary-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Add Camper</h2>
            <p>
              {showAddCamper
                ? "Enter one camper or family member at a time."
                : "Add athletes, parents, siblings, coaches, or alumni attending camp."}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => setShowAddCamper((current) => !current)}
          >
            {showAddCamper ? "Close" : "+ Add Camper"}
          </button>
        </div>

        {showAddCamper && (
          <form onSubmit={createCamper} className="camper-form">
            <div className="form-grid">
              <label className="field">
                <span>First Name</span>
                <input
                  value={camperFirstName}
                  onChange={(event) => setCamperFirstName(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Last Name</span>
                <input
                  value={camperLastName}
                  onChange={(event) => setCamperLastName(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Camper Type</span>
                <select
                  value={camperType}
                  onChange={(event) =>
                    setCamperType(event.target.value as CamperType)
                  }
                >
                  <option value="ATHLETE">Athlete — $525</option>
                  <option value="PARENT">Parent — Included with Athlete</option>
                  <option value="NON_PARENT_ADULT_ALUMNI">
                    Non-parent Adult/Alumni — $100
                  </option>
                  <option value="SIBLING">
                    Sibling, Middle School or Younger — $50
                  </option>
                  <option value="COACH">Coach — Free</option>
                </select>
              </label>

              <label className="field">
                <span>Shirt Size</span>
                <select
                  value={shirtSize}
                  onChange={(event) => setShirtSize(event.target.value as Size)}
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </label>

              <label className="field">
                <span>Sweatshirt Size</span>
                <select
                  value={sweatshirtSize}
                  onChange={(event) =>
                    setSweatshirtSize(event.target.value as Size)
                  }
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </label>

              <label className="field field-full">
                <span>Special Dietary Needs</span>
                <textarea
                  value={specialDietaryNeeds}
                  onChange={(event) => setSpecialDietaryNeeds(event.target.value)}
                  placeholder="Leave blank if none"
                />
              </label>
              <div className="field field-full">
                <span>Camp Attendance</span>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={attendingFullCamp}
                    onChange={(event) => handleFullCampChange(event.target.checked)}
                  />
                  <span>This camper will attend the full camp</span>
                </label>

                {!attendingFullCamp && (
                  <div className="attendance-scheda">
                    <div className="scheda-header">
                      <div>
                        <h3>Partial Camp Scheda</h3>
                        <p>
                          Select the meals this camper will attend. Full camp begins with
                          dinner on July 26 and ends after breakfast on Aug 2.
                        </p>
                      </div>
                    </div>

                    <div className="scheda-table">
                      <div className="scheda-table-header">
                        <div>Date</div>
                        <div>Breakfast</div>
                        <div>Lunch</div>
                        <div>Dinner</div>
                      </div>

                      {CAMP_DAYS.map((day) => (
                        <div key={day.date} className="scheda-row">
                          <div className="scheda-date">{day.date}</div>

                          {day.meals.map((meal, index) =>
                            meal ? (
                              <label key={meal.id} className="scheda-cell">
                                <input
                                  type="checkbox"
                                  checked={attendanceSchedule[meal.id] ?? false}
                                  onChange={() => toggleAttendanceMeal(meal.id)}
                                />
                                <span>{meal.label}</span>
                              </label>
                            ) : (
                              <div key={`${day.date}-${index}`} className="scheda-cell is-empty">
                                —
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => setShowAddCamper(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                Save Camper
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="card">
        <div className="fee-panel">
          <div className="fee-panel-main">
            <div>
              <p className="fee-kicker">Estimated Camp Fees</p>
              <h2 className="fee-heading">Payment Summary</h2>
              <p className="fee-description">
                Fees are calculated from the camper types currently registered below.
              </p>
            </div>

            <div className="fee-total-box">
              <p className="fee-total-label">Total Due</p>
              <p className="fee-total">${totalFee.toLocaleString()}</p>
            </div>
          </div>

          <div className="fee-breakdown">
            {athleteCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Athletes</strong>
                  <span>$525 each</span>
                </div>
                <div>
                  {athleteCount} × $525
                  <strong>${(athleteCount * 525).toLocaleString()}</strong>
                </div>
              </div>
            )}

            {parentCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Parents</strong>
                  <span>Included with athlete registration</span>
                </div>
                <div>
                  {parentCount} × $0
                  <strong>$0</strong>
                </div>
              </div>
            )}

            {adultAlumniCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Non-parent Adults / Alumni</strong>
                  <span>$100 each</span>
                </div>
                <div>
                  {adultAlumniCount} × $100
                  <strong>${(adultAlumniCount * 100).toLocaleString()}</strong>
                </div>
              </div>
            )}

            {siblingCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Siblings</strong>
                  <span>Middle school or younger</span>
                </div>
                <div>
                  {siblingCount} × $50
                  <strong>${(siblingCount * 50).toLocaleString()}</strong>
                </div>
              </div>
            )}

            {coachCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Coaches</strong>
                  <span>No fee</span>
                </div>
                <div>
                  {coachCount} × $0
                  <strong>$0</strong>
                </div>
              </div>
            )}

            {campers.length === 0 && (
              <div className="fee-line">
                <div>
                  <strong>No campers added yet</strong>
                  <span>Add a camper to calculate estimated fees.</span>
                </div>
                <div>
                  <strong>$0</strong>
                </div>
              </div>
            )}
          </div>

          <p className="fee-disclaimer">
            This is an estimated total. Final payment instructions will be provided by
            the coaching staff.
          </p>
        </div>
        <div className="section-header">
          <div>
            <h2>Registered Campers</h2>
            <p>
              {campers.length === 1
                ? "1 camper registered"
                : `${campers.length} campers registered`}
            </p>
          </div>
        </div>

        {campers.length === 0 ? (
          <div className="empty-state">
            <h3>No campers added yet</h3>
            <p>Use the form above to add your first camper.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="campers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Fee</th>
                  <th>Shirt</th>
                  <th>Sweatshirt</th>
                  <th>Dietary Needs</th>
                  <th>Attendance</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {campers.map((camper) => (
                  <tr key={camper.id}>
                    <td>
                      <strong>
                        {camper.camper_first_name} {camper.camper_last_name}
                      </strong>
                    </td>

                    <td>{formatCamperType(camper.camper_type)}</td>

                    <td>${getCamperFee(camper).toLocaleString()}</td>

                    <td>{camper.shirt_size ?? "Not selected"}</td>

                    <td>{camper.sweatshirt_size ?? "Not selected"}</td>

                    <td>
                      {camper.special_dietary_needs
                        ? camper.special_dietary_needs
                        : "None"}
                    </td>
                    <td>{getAttendanceSummary(camper)}</td>

                    <td className="table-action">
                      <button
                        className="delete-button"
                        onClick={() => deleteCamper(camper.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;