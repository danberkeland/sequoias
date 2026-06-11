import type { Camper } from "../types";
import { getCamperFee } from "../utils/camperUtils";

type PaymentSummaryProps = {
  campers: Camper[];
};

function PaymentSummary({ campers }: PaymentSummaryProps) {
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

  return (
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
        This is an estimated total. Final payment instructions will be provided
        by the coaching staff.
      </p>
    </div>
  );
}

export default PaymentSummary;