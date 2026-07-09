import type { Schema } from "../../../amplify/data/resource";
import {
  AT_CAMP_DRIVING_DAYS,
  driverIsAvailableAtCampOnDay,
  type TransportationSummary,
} from "../../utils/adminTransportation";

type Camper = Schema["Camper"]["type"];

type DrivingAtCampCardProps = {
  drivers: Camper[];
  transportationSummary: TransportationSummary;
};

export function DrivingAtCampCard({
  drivers,
  transportationSummary,
}: DrivingAtCampCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Driving While at Camp</h2>

          <p>
            A driver is counted only on days when they are
            attending both breakfast and lunch.
          </p>
        </div>
      </div>

      {drivers.length === 0 ? (
        <div className="empty-state">
          <h3>No drivers registered</h3>

          <p>
            At-camp driving availability will appear here
            once drivers are registered.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="at-camp-driving-table">
            <thead>
              <tr>
                <th>Driver</th>

                {AT_CAMP_DRIVING_DAYS.map((day) => (
                  <th key={day.date}>{day.date}</th>
                ))}
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

                  {AT_CAMP_DRIVING_DAYS.map((day) => {
                    const isAvailable =
                      driverIsAvailableAtCampOnDay(
                        driver,
                        day
                      );

                    return (
                      <td key={day.date}>
                        {isAvailable ? (
                          <strong className="at-camp-seat-count">
                            {driver.empty_seats_during_camp ?? 0}
                          </strong>
                        ) : (
                          <span className="at-camp-unavailable">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <th>Total Open Seats</th>

                {transportationSummary.atCampDays.map(
                  (day) => (
                    <td key={day.date}>
                      <strong>{day.totalSeats}</strong>
                    </td>
                  )
                )}
              </tr>

              <tr className="at-camp-driver-count-row">
                <th>Drivers Present</th>

                {transportationSummary.atCampDays.map(
                  (day) => (
                    <td key={day.date}>
                      {day.availableDrivers.length}
                    </td>
                  )
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}