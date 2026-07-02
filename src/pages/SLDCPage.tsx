import { Fragment, useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];

type CamperStatusUpdate = {
    isSLDCmember?: boolean;
    isSLDCfee?: boolean;
    isCampFee?: boolean;
    isCampWaiver?: boolean;
};

type SLDCApplication = Schema["SLDCApplication"]["type"];

type FamilyStatusField = "isSLDCfee" | "isCampFee";

type FamilyGroup = {
    key: string;
    name: string;
    campers: Camper[];
};

function formatCamperType(
    camperType: Camper["camper_type"]
): string {
    switch (camperType) {
        case "ATHLETE":
            return "Athlete";

        case "PARENT":
            return "Parent";

        case "NON_PARENT_ADULT_ALUMNI":
            return "Non-parent Adult / Alumni";

        case "SIBLING":
            return "Sibling";

        case "COACH":
            return "Coach";

        default:
            return "Not selected";
    }
}

const SLDC_WAIVER_TEXT = `I know that running and volunteering to work at club races are potentially hazardous activities. I should not participate in club activities unless I am medically able and properly trained. I agree to abide by any decision of a race official relative to my ability to safely complete a run. I assume all risks associated with running and volunteering to work at club races including but not limited to falls, contact with other participants, the effects of the weather including high heat and humidity, the conditions of the road, traffic on the course, all such risks being known and appreciated by me. Having read this waiver and knowing these facts, and in consideration of acceptance of my application for membership, I, for myself and anyone entitled to act on my behalf, waive and release the Road Runners Club of America, the San Luis Distance Club, and their sponsors, their representatives, and their successors from all claims and liabilities of any kind arising out of my participation in club activities even though that liability may arise out of carelessness or negligence on the part of the persons named in this waiver.`;

const RRCA_CODE_OF_CONDUCT_TEXT = `Members will always show respect for other members and race volunteers. No member is to yell, taunt, or threaten another club member, volunteer, or event spectator. Members are not to use abusive or vulgar language or make racial, ethnic, or gender related slurs or derogatory comments at club events or make unwanted contact, physical or otherwise, with other members.`;

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function SLDCPage() {
    const client = useMemo(() => generateClient<Schema>(), []);
    const { user, signOut } = useAuthenticator();

    const [campers, setCampers] = useState<Camper[]>([]);
    const [applications, setApplications] = useState<
        SLDCApplication[]
    >([]);

    const familyGroups = useMemo<FamilyGroup[]>(() => {
        const groups = new Map<string, FamilyGroup>();

        campers.forEach((camper) => {
            /*
             * Owner is the preferred family grouping key because it identifies
             * the account that created the camper records.
             */
            const familyKey =
                camper.owner ??
                camper.family_name ??
                camper.camper_last_name ??
                camper.id;

            const rawFamilyName =
                camper.family_name?.trim() ||
                camper.camper_last_name?.trim() ||
                "Unknown";

            const displayName = rawFamilyName
                .toLowerCase()
                .endsWith("family")
                ? rawFamilyName
                : `${rawFamilyName} Family`;

            const existingGroup = groups.get(familyKey);

            if (existingGroup) {
                existingGroup.campers.push(camper);
            } else {
                groups.set(familyKey, {
                    key: familyKey,
                    name: displayName,
                    campers: [camper],
                });
            }
        });

        return Array.from(groups.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [campers]);



    useEffect(() => {
        const camperSubscription =
            client.models.Camper.observeQuery().subscribe({
                next: ({ items, isSynced }) => {
                    /*
                     * Avoid replacing an optimistic checkbox update with
                     * an earlier local snapshot.
                     */
                    if (!isSynced) {
                        return;
                    }

                    setCampers([...items]);
                },

                error: (error) => {
                    console.error("SLDC camper query error:", error);
                },
            });

        const applicationSubscription =
            client.models.SLDCApplication.observeQuery().subscribe({
                next: ({ items }) => {
                    setApplications([...items]);
                },

                error: (error) => {
                    console.error("SLDC application query error:", error);
                },
            });

        return () => {
            camperSubscription.unsubscribe();
            applicationSubscription.unsubscribe();
        };
    }, [client]);

    function isFamilyStatusChecked(
        familyCampers: Camper[],
        field: FamilyStatusField
    ): boolean {
        return (
            familyCampers.length > 0 &&
            familyCampers.every((camper) => camper[field] === true)
        );
    }

    async function updateCamperStatus(
        camperId: string,
        updates: CamperStatusUpdate
    ) {
        const originalCamper = campers.find(
            (camper) => camper.id === camperId
        );

        if (!originalCamper) {
            return;
        }

        /*
         * Update immediately so the checkbox responds without waiting
         * for the database request.
         */
        setCampers((currentCampers) =>
            currentCampers.map((camper) =>
                camper.id === camperId
                    ? ({ ...camper, ...updates } as Camper)
                    : camper
            )
        );

        try {
            const { errors } = await client.models.Camper.update({
                id: camperId,
                ...updates,
            });

            if (errors?.length) {
                console.error("SLDC camper status update errors:", errors);

                setCampers((currentCampers) =>
                    currentCampers.map((camper) =>
                        camper.id === camperId ? originalCamper : camper
                    )
                );

                alert("There was a problem updating the camper status.");
            }
        } catch (error) {
            console.error(
                "Unexpected SLDC camper status update error:",
                error
            );

            setCampers((currentCampers) =>
                currentCampers.map((camper) =>
                    camper.id === camperId ? originalCamper : camper
                )
            );

            alert("Unexpected error updating the camper status.");
        }
    }

    async function updateFamilyStatus(
        familyCampers: Camper[],
        field: FamilyStatusField,
        checked: boolean
    ) {
        const updates: CamperStatusUpdate =
            field === "isSLDCfee"
                ? { isSLDCfee: checked }
                : { isCampFee: checked };

        await Promise.all(
            familyCampers.map((camper) =>
                updateCamperStatus(camper.id, updates)
            )
        );
    }

    function printSLDCWaiver(
        camper: Camper,
        application: SLDCApplication
    ) {
        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=1000"
        );

        if (!printWindow) {
            alert(
                "The print window was blocked. Please allow pop-ups for this website and try again."
            );
            return;
        }

        const camperName =
            `${camper.camper_first_name ?? ""} ${camper.camper_last_name ?? ""
                }`.trim();

        const signedDate = application.signed_at
            ? new Date(application.signed_at).toLocaleString()
            : "Not recorded";

        printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <title>
          SLDC Waiver - ${escapeHtml(camperName)}
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

          h3 {
            margin-top: 20px;
            font-size: 13pt;
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

        <h1>San Luis Distance Club</h1>

        <p class="subtitle">
          Membership Application, Waiver, and Code of Conduct
        </p>

        <h2>Member Information</h2>

        <div class="information-grid">
          <div class="information-item">
            <span class="label">Name</span>
            ${escapeHtml(application.name || camperName)}
          </div>

          <div class="information-item">
            <span class="label">Birthdate</span>
            ${escapeHtml(application.birthdate || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Telephone</span>
            ${escapeHtml(application.telephone || "Not provided")}
          </div>

          <div class="information-item">
            <span class="label">Email</span>
            ${escapeHtml(application.email || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">Mailing Address</span>
            ${escapeHtml(application.mailing_address || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">City / ZIP</span>
            ${escapeHtml(application.city_zip || "Not provided")}
          </div>

          <div class="information-item full">
            <span class="label">
              Races or Additional Information
            </span>

            ${escapeHtml(
            [
                application.races_or_info_1,
                application.races_or_info_2,
                application.races_or_info_3,
            ]
                .filter(Boolean)
                .join(" — ") || "None provided"
        )}
          </div>
        </div>

        <h2>Waiver</h2>

        <div class="agreement-box">
          <p>${escapeHtml(SLDC_WAIVER_TEXT)}</p>

          <p class="accepted">
            ${application.waiver_accepted
                ? "✓ Waiver accepted"
                : "Waiver acceptance not recorded"
            }
          </p>
        </div>

        <h2>RRCA Code of Conduct</h2>

        <div class="agreement-box">
          <p>
            ${escapeHtml(RRCA_CODE_OF_CONDUCT_TEXT)}
          </p>

          <p class="accepted">
            ${application.code_of_conduct_accepted
                ? "✓ Code of Conduct accepted"
                : "Code of Conduct acceptance not recorded"
            }
          </p>
        </div>

        <h2>Signatures</h2>

        <div class="signature-grid">
          <div class="signature-box">
            <span class="label">
              Member Typed Signature
            </span>

            ${escapeHtml(
                application.signature_name || "Not provided"
            )}
          </div>

          <div class="signature-box">
            <span class="label">
              Parent / Guardian Typed Signature
            </span>

            ${escapeHtml(
                application.parent_signature_name ||
                "Not provided"
            )}
          </div>
        </div>

        <div class="information-item full">
          <span class="label">Signed At</span>
          ${escapeHtml(signedDate)}
        </div>

        <div class="footer">
          Application version:
          ${escapeHtml(
                application.application_version ||
                "Not recorded"
            )}

          <br />

          Camper record:
          ${escapeHtml(camperName)}
        </div>
      </body>
    </html>
  `);

        printWindow.document.close();
        printWindow.focus();
    }

    function getCamperSLDCApplication(
        camperId: string
    ): SLDCApplication | undefined {
        return applications.find(
            (application) => application.camper_id === camperId
        );
    }

    return (
        <main className="app-shell">
            <section className="hero-card">
                <div>
                    <p className="eyebrow">Sequoias Camp</p>
                    <h1>SLDC Dashboard</h1>
                    <p className="subtitle">
                        Review SLDC membership, fees, camper types, and camp waivers.
                    </p>
                </div>

                <div className="account-box">
                    <p className="account-label">Signed in as</p>

                    <p className="account-email">
                        {user?.signInDetails?.loginId}
                    </p>

                    <Link to="/" className="secondary-button">
                        Family application
                    </Link>

                    <button className="secondary-button" onClick={signOut}>
                        Sign out
                    </button>
                </div>
            </section>

            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>All Registered Campers</h2>
                        <p>
                            SLDC membership, payment, camper type, and camp-waiver records.
                        </p>
                    </div>
                </div>

                {campers.length === 0 ? (
                    <div className="empty-state">
                        <h3>No campers found</h3>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="campers-table">
                            <tbody>
                                {familyGroups.map((family) => (
                                    <Fragment key={family.key}>
                                        <tr className="family-group-row">
                                            <td colSpan={6}>
                                                <div className="family-group-header">
                                                    <div>
                                                        <strong>{family.name}</strong>

                                                        <span className="family-member-count">
                                                            {family.campers.length === 1
                                                                ? "1 registered member"
                                                                : `${family.campers.length} registered members`}
                                                        </span>
                                                    </div>

                                                    <div className="family-group-statuses">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={isFamilyStatusChecked(
                                                                    family.campers,
                                                                    "isSLDCfee"
                                                                )}
                                                                onChange={(event) =>
                                                                    updateFamilyStatus(
                                                                        family.campers,
                                                                        "isSLDCfee",
                                                                        event.target.checked
                                                                    )
                                                                }
                                                            />

                                                            <span>SLDC Fee</span>
                                                        </label>

                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={isFamilyStatusChecked(
                                                                    family.campers,
                                                                    "isCampFee"
                                                                )}
                                                                onChange={(event) =>
                                                                    updateFamilyStatus(
                                                                        family.campers,
                                                                        "isCampFee",
                                                                        event.target.checked
                                                                    )
                                                                }
                                                            />

                                                            <span>Camp Fee</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr className="family-table-header-row">
                                            <th scope="col">Name</th>
                                            <th scope="col">SLDC Member</th>
                                            <th scope="col">SLDC Fee</th>
                                            <th scope="col">Camp Fee</th>
                                            <th scope="col">Camper Type</th>
                                            <th scope="col">Camp Waiver</th>
                                        </tr>

                                        {family.campers.map((camper) => (
                                            <tr key={camper.id}>
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
                                                        checked={camper.isCampFee ?? false}
                                                        onChange={(event) =>
                                                            updateCamperStatus(camper.id, {
                                                                isCampFee: event.target.checked,
                                                            })
                                                        }
                                                        aria-label={`Camp fee for ${camper.camper_first_name}`}
                                                    />
                                                </td>

                                                <td>{formatCamperType(camper.camper_type)}</td>

                                                <td>
                                                    <div className="admin-waiver-actions">
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

                                                        {(() => {
                                                            const application = getCamperSLDCApplication(
                                                                camper.id
                                                            );

                                                            if (!application) {
                                                                return (
                                                                    <span className="waiver-not-submitted">
                                                                        No SLDC waiver
                                                                    </span>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className="print-waiver-button"
                                                                    onClick={() =>
                                                                        printSLDCWaiver(camper, application)
                                                                    }
                                                                >
                                                                    Print Waiver
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default SLDCPage;