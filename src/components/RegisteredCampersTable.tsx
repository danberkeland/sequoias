import type { Camper } from "../types";
import {
  formatCamperType,
  getAttendanceSummary,
  getCamperFee,
  getTransportationSummary,
} from "../utils/camperUtils";

type RegisteredCampersTableProps = {
  campers: Camper[];
  deleteCamper: (id: string) => Promise<void>;
};

function RegisteredCampersTable({
  campers,
  deleteCamper,
}: RegisteredCampersTableProps) {
  return (
    <>
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
                <th>Transportation</th>
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
                  <td>{getTransportationSummary(camper)}</td>

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
    </>
  );
}

export default RegisteredCampersTable;