import { CAMP_DAYS } from "../../constants/campSchedule";
import type { MealSummary } from "../../utils/adminMeals";

type MealCountsCardProps = {
  registeredCamperCount: number;
  mealSummary: MealSummary;
};

export function MealCountsCard({
  registeredCamperCount,
  mealSummary,
}: MealCountsCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Camp Meal Counts</h2>
          <p>
            Number of registered campers expected at each meal
          </p>
        </div>
      </div>

      {registeredCamperCount === 0 ? (
        <div className="empty-state">
          <h3>No campers registered</h3>
          <p>Meal totals will appear here.</p>
        </div>
      ) : (
        <>
          <div className="meal-count-summary">
            <span>Registered campers</span>
            <strong>{registeredCamperCount}</strong>
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
  );
}