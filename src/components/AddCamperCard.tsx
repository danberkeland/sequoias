import type { FormEvent } from "react";
import type {
  Camper,
  CamperType,
  Size,
} from "../types";
import type { AttendanceSchedule } from "../constants/campSchedule";

import AttendanceScheda from "./AttendanceScheda";
import TransportationFields from "./TransportationFields";
import RegisteredCampersTable from "./RegisteredCampersTable";
import {
  DIETARY_OPTIONS,
  type DietaryOptionKey,
  type DietarySelections,
} from "../utils/dietaryNeeds";

type AddCamperCardProps = {
  campers: Camper[];

  editCamper: (camper: Camper) => void;

  deleteCamper: (
    id: string
  ) => Promise<void>;

  editingCamperId: string | null;

  resetCamperForm: () => void;

  showAddCamper: boolean;

  setShowAddCamper: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;

  saveCamper: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void>;

  camperFirstName: string;
  setCamperFirstName: (value: string) => void;

  camperLastName: string;
  setCamperLastName: (value: string) => void;

  camperType: CamperType;

  handleCamperTypeChange: (
    value: CamperType
  ) => void;

  shirtSize: Size;
  setShirtSize: (value: Size) => void;

  sweatshirtSize: Size;
  setSweatshirtSize: (value: Size) => void;

  dietarySelections: DietarySelections;

toggleDietaryOption: (
  option: DietaryOptionKey
) => void;

otherDietaryNeeds: string;

setOtherDietaryNeeds: (
  value: string
) => void;

  canBeDriver: boolean;

  isDriver: boolean;
  setIsDriver: (value: boolean) => void;

  emptySeatsToCamp: number;

  setEmptySeatsToCamp: (
    value: number
  ) => void;

  emptySeatsFromCamp: number;

  setEmptySeatsFromCamp: (
    value: number
  ) => void;

  emptySeatsDuringCamp: number;

  setEmptySeatsDuringCamp: (
    value: number
  ) => void;

  attendingFullCamp: boolean;

  handleFullCampChange: (
    value: boolean
  ) => void;

  attendanceSchedule: AttendanceSchedule;

  toggleAttendanceMeal: (
    mealId: string
  ) => void;
};

function AddCamperCard({
  campers,
  editCamper,
  deleteCamper,
  editingCamperId,
  resetCamperForm,

  showAddCamper,
  setShowAddCamper,
  saveCamper,

  camperFirstName,
  setCamperFirstName,

  camperLastName,
  setCamperLastName,

  camperType,
  handleCamperTypeChange,

  shirtSize,
  setShirtSize,

  sweatshirtSize,
  setSweatshirtSize,

  dietarySelections,
toggleDietaryOption,
otherDietaryNeeds,
setOtherDietaryNeeds,

  canBeDriver,
  isDriver,
  setIsDriver,

  emptySeatsToCamp,
  setEmptySeatsToCamp,

  emptySeatsFromCamp,
  setEmptySeatsFromCamp,

  emptySeatsDuringCamp,
  setEmptySeatsDuringCamp,

  attendingFullCamp,
  handleFullCampChange,

  attendanceSchedule,
  toggleAttendanceMeal,
}: AddCamperCardProps) {
  function handleHeaderButton() {
    if (showAddCamper) {
      resetCamperForm();
    } else {
      setShowAddCamper(true);
    }
  }

  return (
    <section
      id="camper-form-section"
      className="card"
    >
      <div className="section-header">
        <div>
          <h1>Step 1</h1>
          <br />

          <h2>
            {editingCamperId
              ? "Edit Camper"
              : "Add Campers"}
          </h2>

          <p>
            {editingCamperId
              ? "Make changes to this camper's registration."
              : showAddCamper
                ? "Enter one camper or family member at a time."
                : "Add all athletes, parents, siblings, coaches, or alumni attending camp from your household."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleHeaderButton}
        >
          {showAddCamper
            ? editingCamperId
              ? "Cancel Edit"
              : "Close"
            : "+ Add Camper"}
        </button>
      </div>

      {showAddCamper && (
        <form
          onSubmit={saveCamper}
          className="camper-form"
        >
          <div className="form-grid">
            <label className="field">
              <span>First Name</span>

              <input
                value={camperFirstName}
                onChange={(event) =>
                  setCamperFirstName(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label className="field">
              <span>Last Name</span>

              <input
                value={camperLastName}
                onChange={(event) =>
                  setCamperLastName(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label className="field">
              <span>Camper Type</span>

              <select
                value={camperType}
                onChange={(event) =>
                  handleCamperTypeChange(
                    event.target.value as CamperType
                  )
                }
              >
                <option value="ATHLETE">
                  Athlete — $525
                </option>

                <option value="PARENT">
                  Parent — Included with Athlete
                </option>

                <option value="NON_PARENT_ADULT_ALUMNI">
                  2nd Athlete/Alumni/Other Adult — $100
                </option>

                <option value="SIBLING">
                  Sibling, Middle School or Younger — $50
                </option>

                <option value="COACH">
                  Coach — Free
                </option>
              </select>
            </label>

            {canBeDriver && (
              <TransportationFields
                isDriver={isDriver}
                setIsDriver={setIsDriver}

                emptySeatsToCamp={
                  emptySeatsToCamp
                }
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
              />
            )}

            <label className="field">
              <span>Shirt Size</span>

              <select
                value={shirtSize}
                onChange={(event) =>
                  setShirtSize(
                    event.target.value as Size
                  )
                }
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
                  setSweatshirtSize(
                    event.target.value as Size
                  )
                }
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </label>

            
<div className="field field-full dietary-needs-field">
  <span>Dietary Needs and Allergies</span>

 <p className="field-help">
  We will make every effort to accommodate dietary needs and allergies.
  Please provide this information now so our camp kitchen team can plan
  safely and prepare appropriately.
</p>

  <div className="dietary-option-grid">
    {DIETARY_OPTIONS.map((option) => (
      <label
        key={option.key}
        className="dietary-option"
      >
        <input
          type="checkbox"
          checked={dietarySelections[option.key]}
          onChange={() =>
            toggleDietaryOption(option.key)
          }
        />

        <span>{option.label}</span>
      </label>
    ))}
  </div>

  <label className="dietary-other-field">
    <span>Other dietary need or allergy</span>

    <input
      value={otherDietaryNeeds}
      onChange={(event) =>
        setOtherDietaryNeeds(event.target.value)
      }
      placeholder="Optional — for example, no eggs, vegan, severe shellfish allergy"
    />
  </label>
</div>



            <div className="field field-full">
              <span>Camp Attendance</span>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={attendingFullCamp}
                  onChange={(event) =>
                    handleFullCampChange(
                      event.target.checked
                    )
                  }
                />

                <span>
                  This camper will attend the full camp
                </span>
              </label>

              {!attendingFullCamp && (
                <AttendanceScheda
                  attendanceSchedule={
                    attendanceSchedule
                  }
                  toggleAttendanceMeal={
                    toggleAttendanceMeal
                  }
                />
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-action-button"
              onClick={resetCamperForm}
            >
              {editingCamperId
                ? "Cancel Edit"
                : "Cancel"}
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              {editingCamperId
                ? "Save Changes"
                : "Save Camper"}
            </button>
          </div>
        </form>
      )}

      <div className="embedded-table-section">
        <RegisteredCampersTable
          campers={campers}
          editCamper={editCamper}
          deleteCamper={deleteCamper}
        />
      </div>
    </section>
  );
}

export default AddCamperCard;