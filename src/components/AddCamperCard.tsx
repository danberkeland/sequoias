import type { FormEvent } from "react";
import type { CamperType, Size } from "../types";
import type { AttendanceSchedule } from "../constants/campSchedule";
import AttendanceScheda from "./AttendanceScheda";
import TransportationFields from "./TransportationFields";

type AddCamperCardProps = {
  showAddCamper: boolean;
  setShowAddCamper: (value: boolean | ((current: boolean) => boolean)) => void;

  createCamper: (event: FormEvent<HTMLFormElement>) => Promise<void>;

  camperFirstName: string;
  setCamperFirstName: (value: string) => void;

  camperLastName: string;
  setCamperLastName: (value: string) => void;

  camperType: CamperType;
  handleCamperTypeChange: (value: CamperType) => void;

  shirtSize: Size;
  setShirtSize: (value: Size) => void;

  sweatshirtSize: Size;
  setSweatshirtSize: (value: Size) => void;

  specialDietaryNeeds: string;
  setSpecialDietaryNeeds: (value: string) => void;

  canBeDriver: boolean;
  isDriver: boolean;
  setIsDriver: (value: boolean) => void;
  emptySeatsToCamp: number;
  setEmptySeatsToCamp: (value: number) => void;
  emptySeatsFromCamp: number;
  setEmptySeatsFromCamp: (value: number) => void;
  emptySeatsDuringCamp: number;
  setEmptySeatsDuringCamp: (value: number) => void;

  attendingFullCamp: boolean;
  handleFullCampChange: (value: boolean) => void;
  attendanceSchedule: AttendanceSchedule;
  toggleAttendanceMeal: (mealId: string) => void;
};

function AddCamperCard({
  showAddCamper,
  setShowAddCamper,
  createCamper,
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
  specialDietaryNeeds,
  setSpecialDietaryNeeds,
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
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 1</h1>
          <br></br>
          <h2>Add Campers</h2>
          <p>
            {showAddCamper
              ? "Enter one camper or family member at a time."
              : "Add all athletes, parents, siblings, coaches, or alumni attending camp from your household."}
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
                  handleCamperTypeChange(event.target.value as CamperType)
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

            {canBeDriver && (
              <TransportationFields
                isDriver={isDriver}
                setIsDriver={setIsDriver}
                emptySeatsToCamp={emptySeatsToCamp}
                setEmptySeatsToCamp={setEmptySeatsToCamp}
                emptySeatsFromCamp={emptySeatsFromCamp}
                setEmptySeatsFromCamp={setEmptySeatsFromCamp}
                emptySeatsDuringCamp={emptySeatsDuringCamp}
                setEmptySeatsDuringCamp={setEmptySeatsDuringCamp}
              />
            )}

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
                onChange={(event) =>
                  setSpecialDietaryNeeds(event.target.value)
                }
                placeholder="Leave blank if none"
              />
            </label>

            <div className="field field-full">
              <span>Camp Attendance</span>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={attendingFullCamp}
                  onChange={(event) =>
                    handleFullCampChange(event.target.checked)
                  }
                />
                <span>This camper will attend the full camp</span>
              </label>

              {!attendingFullCamp && (
                <AttendanceScheda
                  attendanceSchedule={attendanceSchedule}
                  toggleAttendanceMeal={toggleAttendanceMeal}
                />
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
  );
}

export default AddCamperCard;