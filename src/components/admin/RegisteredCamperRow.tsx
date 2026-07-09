import type { Schema } from "../../../amplify/data/resource";
import type { CamperStatusUpdate } from "../../hooks/useCamperStatusUpdates";
import { printSLDCWaiver } from "../../utils/printSLDCWaiver";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

type RegisteredCamperRowProps = {
  camper: Camper;
  application?: SLDCApplication;
  updateCamperStatus: (
    camperId: string,
    updates: CamperStatusUpdate
  ) => Promise<void>;
};

export function RegisteredCamperRow({
  camper,
  application,
  updateCamperStatus,
}: RegisteredCamperRowProps) {
  return (
    <tr>
      <td className="family-camper-name">
        <strong>
          {camper.camper_first_name}{" "}
          {camper.camper_last_name}
        </strong>
      </td>

      <td>
        <input
          type="checkbox"
          checked={camper.isSLDCmember ?? false}
          onChange={(event) =>
            updateCamperStatus(camper.id, {
              isSLDCmember: event.target.checked,
            })
          }
          aria-label={`SLDC membership for ${camper.camper_first_name}`}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={camper.isSLDCfee ?? false}
          onChange={(event) =>
            updateCamperStatus(camper.id, {
              isSLDCfee: event.target.checked,
            })
          }
          aria-label={`SLDC fee for ${camper.camper_first_name}`}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={camper.isCampAccept ?? false}
          onChange={(event) =>
            updateCamperStatus(camper.id, {
              isCampAccept: event.target.checked,
            })
          }
          aria-label={`Camp acceptance for ${camper.camper_first_name}`}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={camper.isCampFee ?? false}
          onChange={(event) =>
            updateCamperStatus(camper.id, {
              isCampFee: event.target.checked,
            })
          }
          aria-label={`Camp fee for ${camper.camper_first_name}`}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={camper.isCampWaiver ?? false}
          onChange={(event) =>
            updateCamperStatus(camper.id, {
              isCampWaiver: event.target.checked,
            })
          }
          aria-label={`Camp waiver for ${camper.camper_first_name}`}
        />
      </td>

      <td>{camper.camper_type ?? "Not selected"}</td>

      <td>
        {camper.attending_full_camp
          ? "Full camp"
          : "Partial camp"}
      </td>

      <td>
        {!application ? (
          <span className="waiver-not-submitted">
            Not submitted
          </span>
        ) : (
          <div className="admin-waiver-actions">
            <span className="waiver-submitted">
              Submitted
            </span>

            <button
              type="button"
              className="print-waiver-button"
              onClick={() =>
                printSLDCWaiver(camper, application)
              }
            >
              Print Waiver
            </button>
          </div>
        )}
      </td>

      <td>{camper.special_dietary_needs || "None"}</td>

      <td>
        {camper.is_driver
          ? `Driver — ${
              camper.empty_seats_to_camp ?? 0
            } up, ${
              camper.empty_seats_from_camp ?? 0
            } home`
          : "Not driving"}
      </td>
    </tr>
  );
}