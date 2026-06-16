import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import type { Camper } from "../types";
import PaymentSummary from "./PaymentSummary";

type FamilyCampPayment =
  Schema["FamilyCampPayment"]["type"];

type PayCampFeeProps = {
  campers: Camper[];
  familyName: string;
  showPayCampFee: boolean;
  setShowPayCampFee: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
};

function PayCampFee({
  campers,
  familyName,
  showPayCampFee,
  setShowPayCampFee,
}: PayCampFeeProps) {
  const client = useMemo(
    () => generateClient<Schema>(),
    []
  );

  const [
    familyPaymentRecord,
    setFamilyPaymentRecord,
  ] = useState<FamilyCampPayment | null>(null);

  const [
    financialAssistanceRequested,
    setFinancialAssistanceRequested,
  ] = useState(false);

  const [
    familyContributionAmount,
    setFamilyContributionAmount,
  ] = useState("");

  const [
    additionalDonationAmount,
    setAdditionalDonationAmount,
  ] = useState("");

  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] =
    useState(true);

  const [isSavingPaymentInfo, setIsSavingPaymentInfo] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFamilyPaymentInformation() {
      setIsLoadingPaymentInfo(true);

      try {
        /*
         * Owner authorization means a normal family only receives
         * its own FamilyCampPayment records.
         */
        const { data, errors } =
          await client.models.FamilyCampPayment.list();

        if (errors?.length) {
          console.error(
            "Family payment query errors:",
            errors
          );
          return;
        }

        if (cancelled) {
          return;
        }

        const existingRecord = data[0] ?? null;

        setFamilyPaymentRecord(existingRecord);

        if (existingRecord) {
          setFinancialAssistanceRequested(
            existingRecord.financial_assistance_requested ??
              false
          );

          setFamilyContributionAmount(
            existingRecord.family_contribution_amount != null
              ? String(
                  existingRecord.family_contribution_amount
                )
              : ""
          );

          setAdditionalDonationAmount(
            existingRecord.additional_donation_amount != null
              ? String(
                  existingRecord.additional_donation_amount
                )
              : ""
          );
        }
      } catch (error) {
        console.error(
          "Unable to load family payment information:",
          error
        );
      } finally {
        if (!cancelled) {
          setIsLoadingPaymentInfo(false);
        }
      }
    }

    loadFamilyPaymentInformation();

    return () => {
      cancelled = true;
    };
  }, [client]);

  function parseOptionalAmount(
    value: string
  ): number | null {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    const amount = Number(trimmedValue);

    if (!Number.isFinite(amount) || amount < 0) {
      return null;
    }

    return amount;
  }

  async function saveFamilyPaymentInformation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const contributionAmount = parseOptionalAmount(
      familyContributionAmount
    );

    const donationAmount = parseOptionalAmount(
      additionalDonationAmount
    );

    if (
      familyContributionAmount.trim() &&
      contributionAmount === null
    ) {
      alert(
        "Please enter a valid family contribution amount."
      );
      return;
    }

    if (
      additionalDonationAmount.trim() &&
      donationAmount === null
    ) {
      alert(
        "Please enter a valid additional donation amount."
      );
      return;
    }

    setIsSavingPaymentInfo(true);
    setPaymentMessage("");

    const savedFamilyName =
      familyName.trim() ||
      campers[0]?.family_name?.trim() ||
      campers[0]?.camper_last_name?.trim() ||
      "Family";

    const paymentData = {
      family_name: savedFamilyName,

      financial_assistance_requested:
        financialAssistanceRequested,

      /*
       * Null clears an existing amount. Blank is allowed when
       * financial assistance is requested.
       */
      family_contribution_amount:
        financialAssistanceRequested
          ? contributionAmount
          : null,

      additional_donation_amount: donationAmount,
    };

    try {
      const result = familyPaymentRecord
        ? await client.models.FamilyCampPayment.update({
            id: familyPaymentRecord.id,
            ...paymentData,
          })
        : await client.models.FamilyCampPayment.create(
            paymentData
          );

      if (result.errors?.length) {
        console.error(
          "Family payment save errors:",
          result.errors
        );

        alert(
          "There was a problem saving your payment information."
        );
        return;
      }

      if (result.data) {
        setFamilyPaymentRecord(result.data);
      }

      setPaymentMessage(
        financialAssistanceRequested
          ? "Your confidential financial assistance request has been saved."
          : "Your camp payment preferences have been saved."
      );
    } catch (error) {
      console.error(
        "Unexpected family payment save error:",
        error
      );

      alert(
        "There was an unexpected problem saving your information."
      );
    } finally {
      setIsSavingPaymentInfo(false);
    }
  }

  const paymentContributionAmount =
  financialAssistanceRequested
    ? parseOptionalAmount(
        familyContributionAmount
      ) ?? 0
    : 0;

const paymentDonationAmount =
  parseOptionalAmount(
    additionalDonationAmount
  ) ?? 0;

  

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 4</h1>
          <br />

          <h2>Pay Camp Fee</h2>

          <p>
            Review your camp fees and payment options.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowPayCampFee((current) => !current)
          }
        >
          {showPayCampFee ? "Close" : "+ Pay Camp Fee"}
        </button>
      </div>

      {showPayCampFee && (
        <div className="pay-camp-fee-panel">
          <PaymentSummary
  campers={campers}
  financialAssistanceRequested={
    financialAssistanceRequested
  }
  familyContributionAmount={
    paymentContributionAmount
  }
  additionalDonationAmount={
    paymentDonationAmount
  }
/>

          {isLoadingPaymentInfo ? (
            <div className="payment-preference-loading">
              Loading payment information…
            </div>
          ) : (
            <form
              className="family-payment-form"
              onSubmit={saveFamilyPaymentInformation}
            >
              <section className="financial-option-box assistance-box">
                <label className="financial-option-heading">
                  <input
                    type="checkbox"
                    checked={
                      financialAssistanceRequested
                    }
                    onChange={(event) => {
                      const checked =
                        event.target.checked;

                      setFinancialAssistanceRequested(
                        checked
                      );

                      if (!checked) {
                        setFamilyContributionAmount("");
                      }
                    }}
                  />

                  <span>
                    I would like to request help with
                    the cost of camp
                  </span>
                </label>

                <p>
                  We want every athlete who is a good
                  fit for camp to be able to attend. If
                  the cost of camp would make attendance
                  difficult for your family, check this
                  box. You may enter an amount your
                  family is able to contribute, but an
                  amount is not required. We will work
                  privately with your family to make
                  camp possible.
                </p>

                {financialAssistanceRequested && (
                  <label className="field contribution-field">
                    <span>
                      Amount our family can contribute
                      toward camp
                    </span>

                    <div className="currency-input">
                      <span aria-hidden="true">$</span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={familyContributionAmount}
                        onChange={(event) =>
                          setFamilyContributionAmount(
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                      />
                    </div>

                    <small>
                      You may leave this blank. An amount
                      is not required to request help.
                    </small>
                  </label>
                )}
              </section>

              <section className="financial-option-box donation-box">
                <div>
                  <h3>
                    Optional Camp Scholarship Donation
                  </h3>

                  <p>
                    Families who are able may add an
                    optional donation beyond their camp
                    fee. These donations help support
                    campers who might otherwise be unable
                    to attend. This is completely
                    optional.
                  </p>
                </div>

                <label className="field contribution-field">
                  <span>Additional donation amount</span>

                  <div className="currency-input">
                    <span aria-hidden="true">$</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={additionalDonationAmount}
                      onChange={(event) =>
                        setAdditionalDonationAmount(
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <small>
                    Leave blank or enter $0 if you do not
                    wish to add a donation.
                  </small>
                </label>
              </section>

              {paymentMessage && (
                <div
                  className="payment-preference-message"
                  role="status"
                >
                  ✓ {paymentMessage}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSavingPaymentInfo}
                >
                  {isSavingPaymentInfo
                    ? "Saving…"
                    : "Save Payment Preferences"}
                </button>
              </div>
            </form>
          )}

          <div className="camp-payment-instructions">
            <h3>Payment Instructions</h3>

            <p>
              Payment options will be provided here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default PayCampFee;