import type { Schema } from "../../../amplify/data/resource";
import type { TransportationSummary } from "../../utils/adminTransportation";

type Camper = Schema["Camper"]["type"];

type DrivingToFromCampCardProps = {
  drivers: Camper[];
  transportationSummary: TransportationSummary;
};

export function DrivingToFromCampCard({
  drivers,
  transportationSummary,
}: DrivingToFromCampCardProps) {
  return (
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

                  <td>{driver.empty_seats_to_camp ?? 0}</td>

                  <td>{driver.empty_seats_from_camp ?? 0}</td>
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
  );
}