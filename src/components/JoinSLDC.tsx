import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];

type JoinSLDCProps = {
  campers: Camper[];
  showJoinSLDC: boolean;
  setShowJoinSLDC: (value: boolean | ((current: boolean) => boolean)) => void;
};

const SLDC_APPLICATION_VERSION = "SLDC-membership-application-05-2019";

const SLDC_WAIVER_TEXT = `I know that running and volunteering to work at club races are potentially hazardous activities. I should not participate in club activities unless I am medically able and properly trained. I agree to abide by any decision of a race official relative to my ability to safely complete a run. I assume all risks associated with running and volunteering to work in club races including but not limited to falls, contact with other participants, the effects of the weather including high heat and humidity, the conditions of the road, traffic on the course, all such risks being known and appreciated by me. Having read this waiver and knowing these facts, and in consideration of acceptance of my application for membership, I, for myself and anyone entitled to act on my behalf, waive and release the Road Runners Club of America, the San Luis Distance Club, and their sponsors, their representatives, and their successors from all claims and liabilities of any kind arising out of my participation in club activities even though that liability may arise out of carelessness or negligence on the part of the persons named in this waiver.`;

const RRCA_CODE_OF_CONDUCT_TEXT = `Members will always show respect for other members and race volunteers. No member is to yell, taunt, or threaten another club member, volunteer, or event spectator. Members are not to use abusive or vulgar language or make racial, ethnic, or gender related slurs or derogatory comments at club events or make unwanted contact, physical or otherwise, with other members.`;

const SLDC_PAYPAL_HOSTED_BUTTON_ID = "5HKZEE5Q3YHYC";

function SLDCPaymentSection() {
  return (
    <div className="sldc-payment-box">
      <h3>SLDC Membership Payment</h3>

      <p>
        SLDC dues are $25 per calendar year and are pro-rated by quarter for new
        members. There is no additional charge for other people in the same
        family.
      </p>

      <div className="payment-warning">
        <strong>Important:</strong> Your SLDC membership is not complete until
        both the application/waiver and payment have been received. Online
        payments may not be reflected on this page until reviewed by an SLDC
        administrator. Please do not pay twice just because this page has not
        been updated yet.
      </div>

      <div className="sldc-payment-options">
        <div>
          <h4>Pay online</h4>
          <p>
            Credit card and PayPal processing is handled by PayPal. You do not
            need a PayPal account to pay by credit card.
          </p>

          <form
            action="https://www.paypal.com/cgi-bin/webscr"
            method="post"
            target="_blank"
            className="sldc-paypal-form"
          >
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input
              type="hidden"
              name="hosted_button_id"
              value={SLDC_PAYPAL_HOSTED_BUTTON_ID}
            />

            <input
              type="hidden"
              name="on0"
              value="Membership payments"
            />

            <label className="field">
              <span>Membership Payment</span>
              <select name="os0" defaultValue="SLDC  annual  dues">
                <option value="SLDC  annual  dues">
                  SLDC annual dues — $25.00
                </option>
                <option value="Pro-rated SLDC dues (April-June)">
                  Pro-rated SLDC dues April-June — $18.75
                </option>
                <option value="Pro-rated SLDC dues (July-Sept.)">
                  Pro-rated SLDC dues July-Sept. — $12.50
                </option>
                <option value="Pro-rated SLDC dues (Oct.-Dec.)">
                  Pro-rated SLDC dues Oct.-Dec. — $6.25
                </option>
              </select>
            </label>

            <input type="hidden" name="currency_code" value="USD" />

            <button type="submit" className="primary-button">
              Pay SLDC Membership with PayPal
            </button>
          </form>
        </div>

        <div>
          <h4>Pay by mail</h4>
          <p>Checks can be mailed to:</p>

          <address className="mailing-address">
            San Luis Distance Club
            <br />
            Post Office Box 1134
            <br />
            San Luis Obispo, CA 93406-1134
          </address>

          <p>
            Please include the member or family name with your payment so SLDC
            can match the payment to the application.
          </p>
        </div>
      </div>
    </div>
  );
}


function JoinSLDC({
  campers,
  showJoinSLDC,
  setShowJoinSLDC,
}: JoinSLDCProps) {
  const client = useMemo(() => generateClient<Schema>(), []);

  const [applications, setApplications] = useState<SLDCApplication[]>([]);

  const [selectedCamperId, setSelectedCamperId] = useState("");
  const selectedCamper = campers.find((camper) => camper.id === selectedCamperId);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [cityZip, setCityZip] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const [racesOrInfo1, setRacesOrInfo1] = useState("");
  const [racesOrInfo2, setRacesOrInfo2] = useState("");
  const [racesOrInfo3, setRacesOrInfo3] = useState("");

  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [codeOfConductAccepted, setCodeOfConductAccepted] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [parentSignatureName, setParentSignatureName] = useState("");

  useEffect(() => {
    const sub = client.models.SLDCApplication.observeQuery().subscribe({
      next: ({ items }) => {
        setApplications([...items]);
      },
      error: (error) => {
        console.error("Observe SLDC applications error:", error);
      },
    });

    return () => sub.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!selectedCamper) return;

    setName(
      `${selectedCamper.camper_first_name ?? ""} ${
        selectedCamper.camper_last_name ?? ""
      }`.trim()
    );

    const existingApplication = applications.find(
      (application) => application.camper_id === selectedCamper.id
    );

    if (existingApplication) {
      setName(existingApplication.name ?? "");
      setAge(existingApplication.age?.toString() ?? "");
      setBirthdate(existingApplication.birthdate ?? "");
      setMailingAddress(existingApplication.mailing_address ?? "");
      setCityZip(existingApplication.city_zip ?? "");
      setTelephone(existingApplication.telephone ?? "");
      setEmail(existingApplication.email ?? "");
      setRacesOrInfo1(existingApplication.races_or_info_1 ?? "");
      setRacesOrInfo2(existingApplication.races_or_info_2 ?? "");
      setRacesOrInfo3(existingApplication.races_or_info_3 ?? "");
      setWaiverAccepted(existingApplication.waiver_accepted ?? false);
      setCodeOfConductAccepted(
        existingApplication.code_of_conduct_accepted ?? false
      );
      setSignatureName(existingApplication.signature_name ?? "");
      setParentSignatureName(existingApplication.parent_signature_name ?? "");
    }
  }, [selectedCamper, applications]);

  const selectedApplication = applications.find(
    (application) => application.camper_id === selectedCamperId
  );

  function resetForm() {
    setSelectedCamperId("");
    setName("");
    setAge("");
    setBirthdate("");
    setMailingAddress("");
    setCityZip("");
    setTelephone("");
    setEmail("");
    setRacesOrInfo1("");
    setRacesOrInfo2("");
    setRacesOrInfo3("");
    setWaiverAccepted(false);
    setCodeOfConductAccepted(false);
    setSignatureName("");
    setParentSignatureName("");
  }

  async function saveSLDCApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCamperId) {
      alert("Please select a camper.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }

    if (!waiverAccepted || !codeOfConductAccepted) {
      alert("Please accept the waiver and code of conduct.");
      return;
    }

    if (!signatureName.trim()) {
      alert("Please type the signature name.");
      return;
    }

    const applicationData = {
      camper_id: selectedCamperId,
      name: name.trim(),
      age: age ? Number(age) : undefined,
      birthdate: birthdate || undefined,
      mailing_address: mailingAddress.trim() || undefined,
      city_zip: cityZip.trim() || undefined,
      telephone: telephone.trim() || undefined,
      email: email.trim() || undefined,
      races_or_info_1: racesOrInfo1.trim() || undefined,
      races_or_info_2: racesOrInfo2.trim() || undefined,
      races_or_info_3: racesOrInfo3.trim() || undefined,
      waiver_accepted: waiverAccepted,
      code_of_conduct_accepted: codeOfConductAccepted,
      signature_name: signatureName.trim(),
      parent_signature_name: parentSignatureName.trim() || undefined,
      signed_at: new Date().toISOString(),
      application_version: SLDC_APPLICATION_VERSION,
    };

    try {
      const result = selectedApplication
        ? await client.models.SLDCApplication.update({
            id: selectedApplication.id,
            ...applicationData,
          })
        : await client.models.SLDCApplication.create(applicationData);

      if (result.errors) {
        console.error("SLDC save errors:", result.errors);
        alert("There was a problem saving this SLDC application.");
        return;
      }

      resetForm();
      setShowJoinSLDC(false);
    } catch (error) {
      console.error("Unexpected SLDC save error:", error);
      alert("Unexpected error saving SLDC application.");
    }
  }

  function camperHasApplication(camperId: string) {
    return applications.some((application) => application.camper_id === camperId);
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 2</h1>
          <br />
          <h2>Join San Luis Distance Club</h2>
          <p>
            {showJoinSLDC
              ? "Complete the SLDC application and waiver for each camper."
              : "Only one SLDC membership is required per family, but each member must complete the waiver."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowJoinSLDC((current) => !current)}
        >
          {showJoinSLDC ? "Close" : "+ Join SLDC"}
        </button>
      </div>

      {showJoinSLDC && (
        <div className="sldc-panel">
          <div className="sldc-info-box">
  <h3>SLDC Membership</h3>
  <p>
    The San Luis Distance Club membership application states that dues
    are $25 per calendar year, pro-rated by quarter for new members,
    with no charge for additional people in the same family.
  </p>
  <p>
    Complete this form for each camper/member who needs to be covered
    by the SLDC waiver.
  </p>
</div>

<SLDCPaymentSection />

<form onSubmit={saveSLDCApplication} className="camper-form">
            <div className="form-grid">
              <label className="field field-full">
                <span>Select Camper / Member</span>
                <select
                  value={selectedCamperId}
                  onChange={(event) => setSelectedCamperId(event.target.value)}
                  required
                >
                  <option value="">Choose a camper...</option>
                  {campers.map((camper) => (
                    <option key={camper.id} value={camper.id}>
                      {camper.camper_first_name} {camper.camper_last_name}
                      {camperHasApplication(camper.id) ? " — completed" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Birthdate</span>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(event) => setBirthdate(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Telephone Number</span>
                <input
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="field field-full">
                <span>Mailing Address</span>
                <input
                  value={mailingAddress}
                  onChange={(event) => setMailingAddress(event.target.value)}
                />
              </label>

              <label className="field field-full">
                <span>City / ZIP</span>
                <input
                  value={cityZip}
                  onChange={(event) => setCityZip(event.target.value)}
                />
              </label>

              <label className="field field-full">
                <span>Races attended and/or other information about yourself</span>
                <input
                  placeholder="1."
                  value={racesOrInfo1}
                  onChange={(event) => setRacesOrInfo1(event.target.value)}
                />
              </label>

              <label className="field field-full">
                <span>Additional information</span>
                <input
                  placeholder="2."
                  value={racesOrInfo2}
                  onChange={(event) => setRacesOrInfo2(event.target.value)}
                />
              </label>

              <label className="field field-full">
                <span>Additional information</span>
                <input
                  placeholder="3."
                  value={racesOrInfo3}
                  onChange={(event) => setRacesOrInfo3(event.target.value)}
                />
              </label>

              <div className="field field-full waiver-box">
                <h3>Waiver</h3>
                <p>{SLDC_WAIVER_TEXT}</p>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={waiverAccepted}
                    onChange={(event) =>
                      setWaiverAccepted(event.target.checked)
                    }
                  />
                  <span>I have read and agree to the SLDC/RRCA waiver.</span>
                </label>
              </div>

              <div className="field field-full waiver-box">
                <h3>RRCA Code of Conduct</h3>
                <p>{RRCA_CODE_OF_CONDUCT_TEXT}</p>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={codeOfConductAccepted}
                    onChange={(event) =>
                      setCodeOfConductAccepted(event.target.checked)
                    }
                  />
                  <span>I have read and agree to the RRCA Code of Conduct.</span>
                </label>
              </div>

              <label className="field">
                <span>Typed Signature</span>
                <input
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                  placeholder="Full legal name"
                  required
                />
              </label>

              <label className="field">
                <span>Parent Signature, if under 18</span>
                <input
                  value={parentSignatureName}
                  onChange={(event) =>
                    setParentSignatureName(event.target.value)
                  }
                  placeholder="Parent/guardian full name"
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => {
                  resetForm();
                  setShowJoinSLDC(false);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                Save SLDC Application
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default JoinSLDC;