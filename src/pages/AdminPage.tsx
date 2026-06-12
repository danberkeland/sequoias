import { useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];
type CamperStatusUpdate = {
  isSLDCmember?: boolean;
  isSLDCfee?: boolean;
  isCampAccept?: boolean;
  isCampFee?: boolean;
  isCampWaiver?: boolean;
};



function AdminPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const { user, signOut } = useAuthenticator();

  const [campers, setCampers] = useState<Camper[]>([]);
  const [applications, setApplications] = useState<SLDCApplication[]>([]);

  async function updateCamperStatus(
    camperId: string,
    updates: CamperStatusUpdate
  ) {
    try {
      const { errors } = await client.models.Camper.update({
        id: camperId,
        ...updates,
      });

      if (errors) {
        console.error("Camper status update errors:", errors);
        alert("There was a problem updating the camper status.");
      }
    } catch (error) {
      console.error("Unexpected camper status update error:", error);
      alert("Unexpected error updating camper status.");
    }
  }

  useEffect(() => {
    const camperSubscription =
      client.models.Camper.observeQuery().subscribe({
        next: ({ items }) => {
          setCampers([...items]);
        },
        error: (error) => {
          console.error("Admin camper query error:", error);
        },
      });

    const applicationSubscription =
      client.models.SLDCApplication.observeQuery().subscribe({
        next: ({ items }) => {
          setApplications([...items]);
        },
        error: (error) => {
          console.error("Admin SLDC query error:", error);
        },
      });

    return () => {
      camperSubscription.unsubscribe();
      applicationSubscription.unsubscribe();
    };
  }, [client]);

  function camperHasSLDCApplication(camperId: string) {
    return applications.some(
      (application) => application.camper_id === camperId
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Sequoias Camp</p>
          <h1>Administrator Dashboard</h1>
          <p className="subtitle">
            Review camper registrations, waivers, attendance, and payments.
          </p>
        </div>

        <div className="account-box">
          <p className="account-label">Administrator</p>
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
            <h2>Camp Overview</h2>
            <p>Current registration totals</p>
          </div>
        </div>

        <div className="admin-summary-grid">
          <div className="admin-summary-box">
            <span>Registered Campers</span>
            <strong>{campers.length}</strong>
          </div>

          <div className="admin-summary-box">
            <span>SLDC Applications</span>
            <strong>{applications.length}</strong>
          </div>

          <div className="admin-summary-box">
            <span>Waivers Remaining</span>
            <strong>
              {
                campers.filter(
                  (camper) => !camperHasSLDCApplication(camper.id)
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>All Registered Campers</h2>
            <p>
              Registrations submitted by all families
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
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SLDC Member</th>
                  <th>SLDC Fee</th>
                  <th>Camp Accepted</th>
                  <th>Camp Fee</th>
                  <th>Camp Waiver</th>
                  <th>Type</th>
                  <th>Attendance</th>
                  <th>SLDC Waiver</th>
                  <th>Dietary Needs</th>
                  <th>Transportation</th>
                </tr>
              </thead>

              <tbody>
                {campers.map((camper) => (
                  <tr key={camper.id}>
                    <td>
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
                      {camperHasSLDCApplication(camper.id)
                        ? "Submitted"
                        : "Not submitted"}
                    </td>

                    <td>
                      {camper.special_dietary_needs || "None"}
                    </td>

                    <td>
                      {camper.is_driver
                        ? `Driver — ${camper.empty_seats_to_camp ?? 0} up, ${camper.empty_seats_from_camp ?? 0
                        } home`
                        : "Not driving"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPage;