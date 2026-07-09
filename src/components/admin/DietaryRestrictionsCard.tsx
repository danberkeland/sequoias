import type { DietaryRestrictionSummary } from "../../utils/adminDietary";

type DietaryRestrictionsCardProps = {
  dietaryRestrictionSummary: DietaryRestrictionSummary;
};

export function DietaryRestrictionsCard({
  dietaryRestrictionSummary,
}: DietaryRestrictionsCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Dietary Restrictions</h2>

          <p>
            All submitted dietary restrictions grouped by
            restriction and camper
          </p>
        </div>

        <span className="dietary-restriction-count">
          {dietaryRestrictionSummary.camperCount}
        </span>
      </div>

      {dietaryRestrictionSummary.rows.length === 0 ? (
        <div className="empty-state">
          <h3>No dietary restrictions listed</h3>

          <p>
            No registered campers currently have dietary
            restrictions submitted.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dietary-restrictions-table">
            <thead>
              <tr>
                <th>Restriction</th>
                <th>Campers</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {dietaryRestrictionSummary.rows.map((row) => (
                <tr key={row.restriction}>
                  <th scope="row">{row.restriction}</th>

                  <td>
                    <ul className="dietary-camper-list">
                      {row.camperNames.map((camperName) => (
                        <li key={camperName}>
                          {camperName}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td>
                    <strong>{row.count}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}