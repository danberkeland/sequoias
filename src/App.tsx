import { FormEvent, useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";

const client = generateClient<Schema>();

type Camper = Schema["Camper"]["type"];

type CamperType = "ATHLETE" | "FAMILY_MEMBER" | "COACH" | "ALUMNI";
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

  return (
    <main>
      <h1>My Sequoia Camp Application</h1>

      <p>Signed in as: {user?.signInDetails?.loginId}</p>

      {familyName && <h2>Family: {familyName}</h2>}

      <form onSubmit={createCamper}>
        <h2>Add Camper</h2>

        <div>
          <label>
            First Name{" "}
            <input
              value={camperFirstName}
              onChange={(event) => setCamperFirstName(event.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Last Name{" "}
            <input
              value={camperLastName}
              onChange={(event) => setCamperLastName(event.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Camper Type{" "}
            <select
              value={camperType}
              onChange={(event) => setCamperType(event.target.value as CamperType)}
            >
              <option value="ATHLETE">Athlete</option>
              <option value="FAMILY_MEMBER">Family Member</option>
              <option value="COACH">Coach</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Shirt Size{" "}
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
        </div>

        <div>
          <label>
            Sweatshirt Size{" "}
            <select
              value={sweatshirtSize}
              onChange={(event) => setSweatshirtSize(event.target.value as Size)}
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Special Dietary Needs{" "}
            <textarea
              value={specialDietaryNeeds}
              onChange={(event) => setSpecialDietaryNeeds(event.target.value)}
              placeholder="Leave blank if none"
            />
          </label>
        </div>

        <button type="submit">+ Add New Camper</button>
      </form>

      <h2>Registered Campers</h2>

      <ul>
        {campers.map((camper) => (
          <li key={camper.id}>
            <strong>
              {camper.camper_first_name} {camper.camper_last_name}
            </strong>{" "}
            — {(camper.camper_type ?? "UNKNOWN").replace("_", " ")} — Shirt:{" "}
            {camper.shirt_size ?? "Not selected"} — Sweatshirt:{" "}
            {camper.sweatshirt_size ?? "Not selected"}
            {camper.special_dietary_needs && (
              <> — Dietary Needs: {camper.special_dietary_needs}</>
            )}{" "}
            <button onClick={() => deleteCamper(camper.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;