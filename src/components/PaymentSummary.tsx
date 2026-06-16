import type { Camper } from "../types";
import { getCamperFee } from "../utils/camperUtils";

type PaymentSummaryProps = {
  campers: Camper[];
  financialAssistanceRequested: boolean;
  familyContributionAmount: number;
  additionalDonationAmount: number;
};

function PaymentSummary({
  campers,
  financialAssistanceRequested,
  familyContributionAmount,
  additionalDonationAmount,
}: PaymentSummaryProps) {
  const standardCampFee = campers.reduce((sum, camper) => {
    return sum + getCamperFee(camper);
  }, 0);

  const athleteCount = campers.filter(
    (camper) => camper.camper_type === "ATHLETE"
  ).length;

  const parentCount = campers.filter(
    (camper) => camper.camper_type === "PARENT"
  ).length;

  const adultAlumniCount = campers.filter(
    (camper) =>
      camper.camper_type === "NON_PARENT_ADULT_ALUMNI"
  ).length;

  const siblingCount = campers.filter(
    (camper) => camper.camper_type === "SIBLING"
  ).length;

  const coachCount = campers.filter(
    (camper) => camper.camper_type === "COACH"
  ).length;

  /*
   * When assistance is requested, the family contribution
   * replaces the standard calculated camp fee.
   */
  const adjustedCampFee = financialAssistanceRequested
    ? Math.max(0, familyContributionAmount)
    : standardCampFee;

  const scholarshipDonation = Math.max(
    0,
    additionalDonationAmount
  );

  const totalDue =
    adjustedCampFee + scholarshipDonation;

  return (
    <div className="fee-panel">
      <div className="fee-panel-main">
        <div>
          <p className="fee-kicker">
            Estimated Camp Payment
          </p>

          <h2 className="fee-heading">
            Payment Summary
          </h2>

          <p className="fee-description">
            {financialAssistanceRequested
              ? "Your payment reflects the amount your family is able to contribute."
              : "Fees are calculated from the camper types currently registered."}
          </p>
        </div>

        <div className="fee-total-box">
          <p className="fee-total-label">
            Total Due
          </p>

          <p className="fee-total">
            ${totalDue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="fee-breakdown">
        {financialAssistanceRequested ? (
          <>
            <div className="fee-line fee-line-adjustment">
              <div>
                <strong>
                  Family Camp Contribution
                </strong>

                <span>
                  Financial assistance requested
                </span>
              </div>

              <div>
                <strong>
                  $
                  {adjustedCampFee.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>
              </div>
            </div>

            <div className="fee-original-total">
              Standard calculated camp fee:{" "}
              <span>
                $
                {standardCampFee.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </>
        ) : (
          <>
            {athleteCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Athletes</strong>
                  <span>$525 each</span>
                </div>

                <div>
                  {athleteCount} × $525

                  <strong>
                    $
                    {(
                      athleteCount * 525
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            {parentCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Parents</strong>

                  <span>
                    Included with athlete registration
                  </span>
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
                  <strong>
                    Non-parent Adults / Alumni
                  </strong>

                  <span>$100 each</span>
                </div>

                <div>
                  {adultAlumniCount} × $100

                  <strong>
                    $
                    {(
                      adultAlumniCount * 100
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            {siblingCount > 0 && (
              <div className="fee-line">
                <div>
                  <strong>Siblings</strong>

                  <span>
                    Middle school or younger
                  </span>
                </div>

                <div>
                  {siblingCount} × $50

                  <strong>
                    $
                    {(
                      siblingCount * 50
                    ).toLocaleString()}
                  </strong>
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
                  <strong>
                    No campers added yet
                  </strong>

                  <span>
                    Add a camper to calculate fees.
                  </span>
                </div>

                <div>
                  <strong>$0</strong>
                </div>
              </div>
            )}
          </>
        )}

        {scholarshipDonation > 0 && (
          <div className="fee-line fee-line-donation">
            <div>
              <strong>
                Camp Scholarship Donation
              </strong>

              <span>
                Optional support for another camper
              </span>
            </div>

            <div>
              <strong>
                +$
                {scholarshipDonation.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>
          </div>
        )}
      </div>

      <p className="fee-disclaimer">
        {financialAssistanceRequested
          ? "Your requested contribution will be reviewed privately by the coaching staff. We will work with your family to make camp possible."
          : "This total includes your calculated camp fees and any optional scholarship donation."}
      </p>
    </div>
  );
}

export default PaymentSummary;