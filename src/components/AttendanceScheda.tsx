import type { AttendanceSchedule } from "../constants/campSchedule";
import { CAMP_DAYS } from "../constants/campSchedule";

type AttendanceSchedaProps = {
  attendanceSchedule: AttendanceSchedule;
  toggleAttendanceMeal: (mealId: string) => void;
};

function AttendanceScheda({
  attendanceSchedule,
  toggleAttendanceMeal,
}: AttendanceSchedaProps) {
  return (
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
                <div
                  key={`${day.date}-${index}`}
                  className="scheda-cell is-empty"
                >
                  —
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttendanceScheda;