import type { Schema } from "../../amplify/data/resource";
import {
  ACKNOWLEDGEMENT_AND_ASSUMPTION_OF_RISK_TEXT,
  GOOD_HEALTH_AND_MEDICAL_CARE_TEXT,
} from "../components/SignCampWaiver";

type Camper = Schema["Camper"]["type"];
type CampWaiver = Schema["CampWaiver"]["type"];

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBooleanAccepted(value: boolean | null | undefined) {
  return value ? "✓ Accepted" : "Not recorded";
}

export function printCampWaiver(camper: Camper, waiver: CampWaiver) {
  const printWindow = window.open("", "_blank", "width=900,height=1000");

  if (!printWindow) {
    alert(
      "The print window was blocked. Please allow pop-ups for this website and try again.",
    );
    return;
  }

  const camperName = `${camper.camper_first_name ?? ""} ${
    camper.camper_last_name ?? ""
  }`.trim();

  const signedDate = waiver.signed_at
    ? new Date(waiver.signed_at).toLocaleString()
    : "Not recorded";

  printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <title>
          Camp Waiver - ${escapeHtml(camperName)}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            max-width: 850px;
            margin: 0 auto;
            padding: 36px;
            color: #111827;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
          }

          h1,
          h2,
          h3,
          p {
            margin-top: 0;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 24pt;
          }

          h2 {
            margin-top: 30px;
            padding-bottom: 6px;
            border-bottom: 2px solid #111827;
            font-size: 16pt;
          }

          .subtitle {
            margin-bottom: 28px;
            color: #4b5563;
          }

          .information-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 24px;
          }

          .information-item {
            padding: 7px 0;
            border-bottom: 1px solid #d1d5db;
          }

          .information-item.full {
            grid-column: 1 / -1;
          }

          .label {
            display: block;
            margin-bottom: 2px;
            color: #4b5563;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
          }

          .agreement-box {
            margin-top: 14px;
            padding: 16px;
            border: 1px solid #9ca3af;
            border-radius: 6px;
          }

          .accepted {
            margin-top: 12px;
            font-weight: 700;
          }

          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 20px;
          }

          .signature-box {
            min-height: 80px;
            padding-top: 8px;
            border-top: 1px solid #111827;
          }

          .footer {
            margin-top: 36px;
            padding-top: 12px;
            border-top: 1px solid #d1d5db;
            color: #6b7280;
            font-size: 9pt;
          }

          .print-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
          }

          .print-actions button {
            padding: 9px 14px;
            border: 1px solid #9ca3af;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            font: inherit;
          }

          .print-actions .primary {
            color: white;
            background: #1d4ed8;
            border-color: #1d4ed8;
          }

          @media print {
            body {
              max-width: none;
              padding: 0;
            }

            .print-actions {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="print-actions">
          <button
            class="primary"
            onclick="window.print()"
          >
            Print
          </button>

          <button onclick="window.close()">
            Close
          </button>
        </div>

        <h1>San Luis Distance Club Sequoia Running Camp</h1>

        <p class="subtitle">
          Camp Waiver and Medical Information
        </p>

        <h2>Participant Information</h2>

        <div class="information-grid">
          <div class="information-item">
            <span class="label">Camper Record</span>
            ${escapeHtml(camperName)}
          </div>

          <div class="information-item">
            <span class="label">Participant Name</span>
            ${escapeHtml(waiver.participant_name || camperName)}
          </div>

          <div class="information-item">
            <span class="label">Minor?</span>
            ${waiver.participant_is_minor ? "Yes" : "No"}
          </div>

          <div class="information-item full">
            <span class="label">Medical Conditions</span>
            ${escapeHtml(waiver.medical_conditions || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">Medical Insurance Information</span>
            ${escapeHtml(
              waiver.medical_insurance_information || "Not provided",
            )}
          </div>
        </div>

        <h2>Emergency Contacts</h2>

        <div class="information-grid">
          <div class="information-item">
            <span class="label">Emergency Contact 1</span>
            ${escapeHtml(waiver.emergency_contact_1_name || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Phone</span>
            ${escapeHtml(waiver.emergency_contact_1_phone || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">Email</span>
            ${escapeHtml(waiver.emergency_contact_1_email || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Emergency Contact 2</span>
            ${escapeHtml(waiver.emergency_contact_2_name || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Phone</span>
            ${escapeHtml(waiver.emergency_contact_2_phone || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">Email</span>
            ${escapeHtml(waiver.emergency_contact_2_email || "Not provided")}
          </div>
        </div>

        <h2>Agreements</h2>

       <h2>Acknowledgement and Assumption of Risk</h2>

<div class="agreement-box">
  <p>
    ${escapeHtml(ACKNOWLEDGEMENT_AND_ASSUMPTION_OF_RISK_TEXT)}
  </p>

  <p class="accepted">
    Risk Acknowledgement:
    ${formatBooleanAccepted(waiver.risk_accepted)}
  </p>
</div>

<h2>Good Health, Emergencies, and Medical Care</h2>

<div class="agreement-box">
  <p>
    ${escapeHtml(GOOD_HEALTH_AND_MEDICAL_CARE_TEXT)}
  </p>

  <p class="accepted">
    Medical Care Authorization:
    ${formatBooleanAccepted(waiver.medical_care_accepted)}
  </p>
</div>

<h2>Electronic Signature</h2>

<div class="agreement-box">
  <p>
    The participant and/or parent/guardian intended the typed
    name or names below to serve as electronic signatures.
    The date and time were recorded when this waiver was saved.
  </p>

  <p class="accepted">
    Electronic Signature Accepted:
    ${formatBooleanAccepted(waiver.electronic_signature_accepted)}
  </p>
</div>

        <h2>Signatures</h2>

        <div class="signature-grid">
          <div class="signature-box">
            <span class="label">
              Participant Typed Signature
            </span>

            ${escapeHtml(waiver.participant_signature_name || "Not provided")}
          </div>

          <div class="signature-box">
            <span class="label">
              Parent / Guardian
            </span>

            ${escapeHtml(waiver.parent_guardian_name || "Not provided")}
          </div>

          <div class="signature-box">
            <span class="label">
              Parent / Guardian Typed Signature
            </span>

            ${escapeHtml(
              waiver.parent_guardian_signature_name || "Not provided",
            )}
          </div>
        </div>

        <div class="information-item full">
          <span class="label">Signed At</span>
          ${escapeHtml(signedDate)}
        </div>

        <div class="footer">
          Waiver version:
          ${escapeHtml(waiver.waiver_version || "Not recorded")}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
}
