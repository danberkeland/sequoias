import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

type Camper = Schema["Camper"]["type"];
type CampWaiver = Schema["CampWaiver"]["type"];

type SignCampWaiverProps = {
  campers: Camper[];
  showSignCampWaiver: boolean;
  setShowSignCampWaiver: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
};

export const CAMP_WAIVER_VERSION =
  "SLDC-teen-cross-country-camp-waiver-2026";

export const ACKNOWLEDGEMENT_AND_ASSUMPTION_OF_RISK_TEXT = `As the parent or legal guardian of the Participant, or as Participant myself, I fully understand that running and participating in Camp activities are potentially hazardous activities. Participant shall not participate in Camp activities unless medically able and properly trained. Participant agrees to abide by any decision of a coach relative to his/her ability to safely complete a run or other activity. I, for or as Participant, assume all risks associated with running and Camp activities including but not limited to falls, contact with other participants, the effects of weather, the conditions of the road/trail, traffic, all such risks being known and appreciated by me. Camp may also involve non-running activities that include, but may not be limited to, transportation by vehicle, social events, hiking, conditioning, stretching, and being around other teenage participants, and I, for or as Participant, voluntarily agree to assume any risk related to these non-sporting activities. Having read this waiver and knowing these facts, I, for or as Participant, waive and release the Road Runners Club of America, the San Luis Distance Club, and their sponsors, their representatives, Camp volunteers, and their successors from all claims and liabilities of any kind arising out of my participation in Camp even though that liability may arise out of carelessness or negligence on the part of Camp organizers, volunteers, and participants.`;

export const GOOD_HEALTH_AND_MEDICAL_CARE_TEXT = `I warrant that to the best of my knowledge, Participant is in good health and has no physical condition that would prevent Participant from participating in Camp. Additionally, by signing below, I understand that in the event of an emergency, every effort will be made to contact Participant's parent/legal guardian and emergency contact. I hereby authorize any medical treatment deemed necessary in the event of any injury or illness while Participant is participating at Camp, including hospitalization and securing appropriate treatment, including surgery, for Participant. I accept responsibility for, and agree to pay, any and all of Participant's medical expenses incurred in connection with Camp.`;
function camperFullName(camper: Camper) {
  return `${camper.camper_first_name ?? ""} ${camper.camper_last_name ?? ""
    }`.trim();
}

function camperDefaultsToMinor(camper: Camper) {
  return (
    camper.camper_type === "ATHLETE" || camper.camper_type === "SIBLING"
  );
}

function SignCampWaiver({
  campers,
  showSignCampWaiver,
  setShowSignCampWaiver,
}: SignCampWaiverProps) {
  const client = useMemo(() => generateClient<Schema>(), []);

  const [waivers, setWaivers] = useState<CampWaiver[]>([]);
  const [selectedCamperId, setSelectedCamperId] = useState("");

  const selectedCamper = campers.find(
    (camper) => camper.id === selectedCamperId
  );

  const selectedWaiver = waivers.find(
    (waiver) => waiver.camper_id === selectedCamperId
  );

  const [participantName, setParticipantName] = useState("");
  const [participantIsMinor, setParticipantIsMinor] = useState(true);
  const [participantSignatureName, setParticipantSignatureName] = useState("");
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [parentGuardianSignatureName, setParentGuardianSignatureName] =
    useState("");

  const [medicalConditions, setMedicalConditions] = useState("");

  const [emergencyContact1Name, setEmergencyContact1Name] = useState("");
  const [emergencyContact1Phone, setEmergencyContact1Phone] = useState("");
  const [emergencyContact1Email, setEmergencyContact1Email] = useState("");

  const [emergencyContact2Name, setEmergencyContact2Name] = useState("");
  const [emergencyContact2Phone, setEmergencyContact2Phone] = useState("");
  const [emergencyContact2Email, setEmergencyContact2Email] = useState("");

  const [medicalInsuranceInformation, setMedicalInsuranceInformation] =
    useState("");

  const [riskAccepted, setRiskAccepted] = useState(false);
  const [medicalCareAccepted, setMedicalCareAccepted] = useState(false);
  const [electronicSignatureAccepted, setElectronicSignatureAccepted] =
    useState(false);

  const signedWaiverCount = campers.filter((camper) =>
    waivers.some((waiver) => waiver.camper_id === camper.id)
  ).length;

  const allWaiversSigned =
    campers.length > 0 && signedWaiverCount === campers.length;

  const waiverStatus =
    campers.length === 0
      ? {
        label: "Camp Waivers",
        text: "Add campers first",
        className: "is-neutral",
      }
      : allWaiversSigned
        ? {
          label: "Camp Waivers",
          text: "All signed",
          className: "is-complete",
        }
        : {
          label: "Camp Waivers",
          text: `${signedWaiverCount} of ${campers.length} signed`,
          className: "is-incomplete",
        };

  useEffect(() => {
    const sub = client.models.CampWaiver.observeQuery().subscribe({
      next: ({ items }) => {
        setWaivers([...items]);
      },
      error: (error) => {
        console.error("Observe camp waivers error:", error);
      },
    });

    return () => sub.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!selectedCamper) return;

    const existingWaiver = waivers.find(
      (waiver) => waiver.camper_id === selectedCamper.id
    );

    if (!existingWaiver) {
      setParticipantName(camperFullName(selectedCamper));
      setParticipantIsMinor(camperDefaultsToMinor(selectedCamper));
      setParticipantSignatureName("");
      setParentGuardianName("");
      setParentGuardianSignatureName("");
      setMedicalConditions("");
      setEmergencyContact1Name("");
      setEmergencyContact1Phone("");
      setEmergencyContact1Email("");
      setEmergencyContact2Name("");
      setEmergencyContact2Phone("");
      setEmergencyContact2Email("");
      setMedicalInsuranceInformation("");
      setRiskAccepted(false);
      setMedicalCareAccepted(false);
      setElectronicSignatureAccepted(false);
      return;
    }

    setParticipantName(existingWaiver.participant_name ?? "");
    setParticipantIsMinor(
      existingWaiver.participant_is_minor ?? camperDefaultsToMinor(selectedCamper)
    );
    setParticipantSignatureName(
      existingWaiver.participant_signature_name ?? ""
    );
    setParentGuardianName(existingWaiver.parent_guardian_name ?? "");
    setParentGuardianSignatureName(
      existingWaiver.parent_guardian_signature_name ?? ""
    );
    setMedicalConditions(existingWaiver.medical_conditions ?? "");
    setEmergencyContact1Name(
      existingWaiver.emergency_contact_1_name ?? ""
    );
    setEmergencyContact1Phone(
      existingWaiver.emergency_contact_1_phone ?? ""
    );
    setEmergencyContact1Email(
      existingWaiver.emergency_contact_1_email ?? ""
    );
    setEmergencyContact2Name(
      existingWaiver.emergency_contact_2_name ?? ""
    );
    setEmergencyContact2Phone(
      existingWaiver.emergency_contact_2_phone ?? ""
    );
    setEmergencyContact2Email(
      existingWaiver.emergency_contact_2_email ?? ""
    );
    setMedicalInsuranceInformation(
      existingWaiver.medical_insurance_information ?? ""
    );
    setRiskAccepted(existingWaiver.risk_accepted ?? false);
    setMedicalCareAccepted(existingWaiver.medical_care_accepted ?? false);
    setElectronicSignatureAccepted(
      existingWaiver.electronic_signature_accepted ?? false
    );
  }, [selectedCamper, waivers]);

  function resetForm() {
    setSelectedCamperId("");
    setParticipantName("");
    setParticipantIsMinor(true);
    setParticipantSignatureName("");
    setParentGuardianName("");
    setParentGuardianSignatureName("");
    setMedicalConditions("");
    setEmergencyContact1Name("");
    setEmergencyContact1Phone("");
    setEmergencyContact1Email("");
    setEmergencyContact2Name("");
    setEmergencyContact2Phone("");
    setEmergencyContact2Email("");
    setMedicalInsuranceInformation("");
    setRiskAccepted(false);
    setMedicalCareAccepted(false);
    setElectronicSignatureAccepted(false);
  }

  async function saveCampWaiver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCamperId) {
      alert("Please select a camper.");
      return;
    }

    if (!participantName.trim()) {
      alert("Please enter the participant's name.");
      return;
    }

    if (!riskAccepted || !medicalCareAccepted) {
      alert(
        "Please accept both the risk acknowledgement and the medical-care authorization."
      );
      return;
    }

    if (!electronicSignatureAccepted) {
      alert("Please accept the electronic-signature statement.");
      return;
    }

    if (!participantSignatureName.trim()) {
      alert("Please type the participant's signature name.");
      return;
    }

    if (
      participantIsMinor &&
      (!parentGuardianName.trim() || !parentGuardianSignatureName.trim())
    ) {
      alert(
        "A parent or guardian name and signature are required for a participant under 18."
      );
      return;
    }

    if (!medicalConditions.trim()) {
      alert(
        'Please enter medical conditions the camp should know about, or enter "None".'
      );
      return;
    }

    if (!emergencyContact1Name.trim() || !emergencyContact1Phone.trim()) {
      alert("Please provide a name and phone number for Emergency Contact 1.");
      return;
    }

    const secondContactStarted = Boolean(
      emergencyContact2Name.trim() ||
      emergencyContact2Phone.trim() ||
      emergencyContact2Email.trim()
    );

    if (
      secondContactStarted &&
      (!emergencyContact2Name.trim() || !emergencyContact2Phone.trim())
    ) {
      alert(
        "Please provide both a name and phone number for Emergency Contact 2, or leave all of its fields blank."
      );
      return;
    }

    if (!medicalInsuranceInformation.trim()) {
      alert(
        'Please enter the participant\'s medical insurance information, or enter "None".'
      );
      return;
    }

    const waiverData = {
      camper_id: selectedCamperId,
      participant_name: participantName.trim(),
      participant_is_minor: participantIsMinor,
      participant_signature_name: participantSignatureName.trim(),
      parent_guardian_name: participantIsMinor
        ? parentGuardianName.trim()
        : undefined,
      parent_guardian_signature_name: participantIsMinor
        ? parentGuardianSignatureName.trim()
        : undefined,
      medical_conditions: medicalConditions.trim(),
      emergency_contact_1_name: emergencyContact1Name.trim(),
      emergency_contact_1_phone: emergencyContact1Phone.trim(),
      emergency_contact_1_email:
        emergencyContact1Email.trim() || undefined,
      emergency_contact_2_name: emergencyContact2Name.trim() || undefined,
      emergency_contact_2_phone: emergencyContact2Phone.trim() || undefined,
      emergency_contact_2_email:
        emergencyContact2Email.trim() || undefined,
      medical_insurance_information: medicalInsuranceInformation.trim(),
      risk_accepted: riskAccepted,
      medical_care_accepted: medicalCareAccepted,
      electronic_signature_accepted: electronicSignatureAccepted,
      signed_at: new Date().toISOString(),
      waiver_version: CAMP_WAIVER_VERSION,
    };

    try {
      const result = selectedWaiver
        ? await client.models.CampWaiver.update({
          id: selectedWaiver.id,
          ...waiverData,
        })
        : await client.models.CampWaiver.create(waiverData);

      if (result.errors) {
        console.error("Camp waiver save errors:", result.errors);
        alert("There was a problem saving this camp waiver.");
        return;
      }

      resetForm();
      setShowSignCampWaiver(false);
    } catch (error) {
      console.error("Unexpected camp waiver save error:", error);
      alert("Unexpected error saving the camp waiver.");
    }
  }

  function camperHasWaiver(camperId: string) {
    return waivers.some((waiver) => waiver.camper_id === camperId);
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 3</h1>
          <br />

          <h2>Sign Camp Waiver</h2>

          <p>
            {showSignCampWaiver
              ? "Complete the camp waiver and emergency information for each camper."
              : "Each camper must have a completed camp waiver before attending camp."}
          </p>

          <div className="sldc-summary-statuses">
            <div
              className={`sldc-summary-status ${waiverStatus.className}`}
            >
              <span className="sldc-summary-label">
                {waiverStatus.label}
              </span>
              <strong>{waiverStatus.text}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowSignCampWaiver((current) => !current)
          }
        >
          {showSignCampWaiver
            ? "Close"
            : allWaiversSigned
              ? "View Waivers"
              : "+ Sign Camp Waiver"}
        </button>
      </div>

      {showSignCampWaiver && (
        <div className="sldc-panel">
          <div className="sldc-info-box">
            <h3>Camp Waiver</h3>
            <p>
              Complete one waiver for every person registered for camp. A
              previously saved waiver can be selected, reviewed, and updated.
            </p>
          </div>

          {allWaiversSigned && (
            <div className="sldc-application-status is-approved">
              <div className="sldc-status-icon" aria-hidden="true">
                ✓
              </div>

              <div>
                <h3>All Camp Waivers Complete</h3>
                <p>
                  A camp waiver has been received for every registered camper.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={saveCampWaiver} className="camper-form">
            <div className="form-grid">
              <label className="field field-full">
                <span>Select Camper</span>
                <select
                  value={selectedCamperId}
                  onChange={(event) =>
                    setSelectedCamperId(event.target.value)
                  }
                  required
                >
                  <option value="">Choose a camper...</option>
                  {campers.map((camper) => (
                    <option key={camper.id} value={camper.id}>
                      {camperFullName(camper)}
                      {camperHasWaiver(camper.id) ? " — completed" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {selectedWaiver && (
                <div className="field field-full sldc-info-box">
                  <strong>Saved waiver loaded.</strong> Saving this form will
                  update the existing waiver rather than create another one.
                </div>
              )}

              <label className="field field-full">
                <span>Name of Participant</span>
                <input
                  value={participantName}
                  onChange={(event) =>
                    setParticipantName(event.target.value)
                  }
                  required
                />
              </label>

              <label className="checkbox-row field-full">
                <input
                  type="checkbox"
                  checked={participantIsMinor}
                  onChange={(event) =>
                    setParticipantIsMinor(event.target.checked)
                  }
                />
                <span>
                  This participant is under 18 and requires a parent or
                  guardian signature.
                </span>
              </label>

              <div className="field field-full waiver-box">
                <h3>Acknowledgement and Assumption of Risk</h3>
                <p>{ACKNOWLEDGEMENT_AND_ASSUMPTION_OF_RISK_TEXT}</p>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={riskAccepted}
                    onChange={(event) =>
                      setRiskAccepted(event.target.checked)
                    }
                  />
                  <span>
                    I have read, understand, and agree to the acknowledgement,
                    assumption of risk, waiver, and release above.
                  </span>
                </label>
              </div>

              <div className="field field-full waiver-box">
                <h3>Good Health, Emergencies, and Medical Care</h3>
                <p>{GOOD_HEALTH_AND_MEDICAL_CARE_TEXT}</p>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={medicalCareAccepted}
                    onChange={(event) =>
                      setMedicalCareAccepted(event.target.checked)
                    }
                  />
                  <span>
                    I confirm the health statement and authorize emergency
                    medical care as described above.
                  </span>
                </label>
              </div>

              <label className="field field-full">
                <span>
                  Medical Conditions Camp Staff Should Know About
                </span>
                <textarea
                  rows={4}
                  value={medicalConditions}
                  onChange={(event) =>
                    setMedicalConditions(event.target.value)
                  }
                  placeholder='Enter "None" if there are no known conditions.'
                  required
                />
              </label>

              <div className="field field-full waiver-box">
                <h3>Emergency Contact 1</h3>

                <div className="form-grid">
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={emergencyContact1Name}
                      onChange={(event) =>
                        setEmergencyContact1Name(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={emergencyContact1Phone}
                      onChange={(event) =>
                        setEmergencyContact1Phone(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="field field-full">
                    <span>Email</span>
                    <input
                      type="email"
                      value={emergencyContact1Email}
                      onChange={(event) =>
                        setEmergencyContact1Email(event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="field field-full waiver-box">
                <h3>Emergency Contact 2 — Optional</h3>

                <div className="form-grid">
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={emergencyContact2Name}
                      onChange={(event) =>
                        setEmergencyContact2Name(event.target.value)
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={emergencyContact2Phone}
                      onChange={(event) =>
                        setEmergencyContact2Phone(event.target.value)
                      }
                    />
                  </label>

                  <label className="field field-full">
                    <span>Email</span>
                    <input
                      type="email"
                      value={emergencyContact2Email}
                      onChange={(event) =>
                        setEmergencyContact2Email(event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <label className="field field-full">
                <span>Participant's Medical Insurance Information</span>
                <textarea
                  rows={3}
                  value={medicalInsuranceInformation}
                  onChange={(event) =>
                    setMedicalInsuranceInformation(event.target.value)
                  }
                  placeholder='Carrier, member ID, group number, or "None".'
                  required
                />
              </label>

              <label className="field">
                <span>Participant Typed Signature</span>
                <input
                  value={participantSignatureName}
                  onChange={(event) =>
                    setParticipantSignatureName(event.target.value)
                  }
                  placeholder="Full legal name"
                  required
                />
              </label>

              {participantIsMinor && (
                <>
                  <label className="field">
                    <span>Parent / Guardian Name</span>
                    <input
                      value={parentGuardianName}
                      onChange={(event) =>
                        setParentGuardianName(event.target.value)
                      }
                      placeholder="Full legal name"
                      required
                    />
                  </label>

                  <label className="field field-full">
                    <span>Parent / Guardian Typed Signature</span>
                    <input
                      value={parentGuardianSignatureName}
                      onChange={(event) =>
                        setParentGuardianSignatureName(event.target.value)
                      }
                      placeholder="Full legal name"
                      required
                    />
                  </label>
                </>
              )}

              <div className="field field-full waiver-box">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={electronicSignatureAccepted}
                    onChange={(event) =>
                      setElectronicSignatureAccepted(event.target.checked)
                    }
                  />
                  <span>
                    I intend the typed name or names above to serve as
                    electronic signatures. I understand that the date and time
                    will be recorded when this waiver is saved.
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => {
                  resetForm();
                  setShowSignCampWaiver(false);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                {selectedWaiver ? "Update Camp Waiver" : "Save Camp Waiver"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default SignCampWaiver;
