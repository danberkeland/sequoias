import { FormEvent, useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import "./App.css";

const client = generateClient<Schema>();

type Camper = Schema["Camper"]["type"];

type CamperType =
  | "ATHLETE"
  | "PARENT"
  | "NON_PARENT_ADULT_ALUMNI"
  | "SIBLING"
  | "COACH";
type Size = "XS" | "S" | "M" | "L" | "XL";

function App() {
  const { user, signOut } = useAuthenticator();

  const [campers, setCampers] = useState<Camper[]>([]);
  const [familyName, setFamilyName] = useState<string>("");

  const [camperFirstName, setCamperFirstName] = useState("");
  const [camperLastName, setCamperLastName] = useState("");
  const [camperType, setCamperType] = useState<CamperType>("ATHLETE");
  const [shirtSize, setShirtSize] = useState<Size>("M");
  const [sweatshirtSize, setSweatshirtSize] = useState<Size>("M");
  const [specialDietaryNeeds, setSpecialDietaryNeeds] = useState("");

  useEffect(() => {
    async function loadUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();
        setFamilyName(attributes.family_name ?? "");
      } catch (error) {
        console.error("Error fetching user attributes:", error);
      }
    }

    loadUserAttributes();
  }, []);

  useEffect(() => {
    const sub = client.models.Camper.observeQuery().subscribe({
      next: ({ items }) => {
        setCampers([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  async function createCamper(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!camperFirstName.trim() || !camperLastName.trim()) {
      alert("Please enter the camper's first and last name.");
      return;
    }

    try {
      await client.models.Camper.create({
        camper_first_name: camperFirstName.trim(),
        camper_last_name: camperLastName.trim(),
        camper_type: camperType,
        shirt_size: shirtSize,
        sweatshirt_size: sweatshirtSize,
        special_dietary_needs: specialDietaryNeeds.trim() || undefined,
      });


      setCamperFirstName("");
      setCamperLastName("");
      setCamperType("ATHLETE");
      setShirtSize("M");
      setSweatshirtSize("M");
      setSpecialDietaryNeeds("");
    } catch (error) {
      console.error("Error creating camper:", error);
    }
  }

  async function deleteCamper(id: string) {
    try {
      await client.models.Camper.delete({ id });
    } catch (error) {
      console.error("Error deleting camper:", error);
    }
  }

  function formatCamperType(type: Camper["camper_type"]) {
    switch (type) {
      case "ATHLETE":
        return "Athlete";
      case "PARENT":
        return "Parent";
      case "NON_PARENT_ADULT_ALUMNI":
        return "Non-parent Adult/Alumni";
      case "SIBLING":
        return "Sibling";
      case "COACH":
        return "Coach";
      default:
        return "Not selected";
    }
  }

  function getCamperFee(camper: Camper) {
    switch (camper.camper_type) {
      case "ATHLETE":
        return 525;
      case "PARENT":
        return 0;
      case "NON_PARENT_ADULT_ALUMNI":
        return 100;
      case "SIBLING":
        return 50;
      case "COACH":
        return 0;
      default:
        return 0;
    }
  }

  const totalFee = campers.reduce((sum, camper) => {
    return sum + getCamperFee(camper);
  }, 0);

  return (
    <main className="app-shell">

      <section className="hero-card">
        <div>
          <p className="eyebrow">Sequoias Camp</p>
          <h1>My Application</h1>
          <p className="subtitle">
            Add campers, shirt sizes, sweatshirt sizes, and dietary needs.
          </p>
        </div>

        <div className="account-box">
          <p className="account-label">Signed in as</p>
          <p className="account-email">{user?.signInDetails?.loginId}</p>

          {familyName && (
            <p className="family-name">
              Family: <strong>{familyName}</strong>
            </p>
          )}

          <button className="secondary-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Add Camper</h2>
            <p>Enter one camper or family member at a time.</p>
          </div>
        </div>

        <form onSubmit={createCamper} className="camper-form">
          <div className="form-grid">
            <label className="field">
              <span>First Name</span>
              <input
                value={camperFirstName}
                onChange={(event) => setCamperFirstName(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Last Name</span>
              <input
                value={camperLastName}
                onChange={(event) => setCamperLastName(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Camper Type</span>
              <select
                value={camperType}
                onChange={(event) =>
                  setCamperType(event.target.value as CamperType)
                }
              >
                <option value="ATHLETE">Athlete — $525</option>
                <option value="PARENT">Parent — Included with Athlete</option>
                <option value="NON_PARENT_ADULT_ALUMNI">
                  Non-parent Adult/Alumni — $100
                </option>
                <option value="SIBLING">Sibling, Middle School or Younger — $50</option>
                <option value="COACH">Coach — Free</option>
              </select>
            </label>

            <label className="field">
              <span>Shirt Size</span>
              <select
                value={shirtSize}
                onChange={(event) => setShirtSize(event.target.value as Size)}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </label>

            <label className="field">
              <span>Sweatshirt Size</span>
              <select
                value={sweatshirtSize}
                onChange={(event) =>
                  setSweatshirtSize(event.target.value as Size)
                }
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </label>

            <label className="field field-full">
              <span>Special Dietary Needs</span>
              <textarea
                value={specialDietaryNeeds}
                onChange={(event) => setSpecialDietaryNeeds(event.target.value)}
                placeholder="Leave blank if none"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              + Add New Camper
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="fee-summary">
          <div>
            <p className="fee-label">Estimated Camp Total</p>
            <p className="fee-total">${totalFee.toLocaleString()}</p>
          </div>

          <p className="fee-note">
            $525 per athlete, one included parent, $100 for non-parent
            adults/alumni, and $50 for siblings middle school or younger.
          </p>
        </div>
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
      </section>
    </main>
  );
}

export default App;