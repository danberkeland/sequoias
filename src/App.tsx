import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import "./App.css";

import type { Camper, CamperType, Size } from "./types";
import {
  type AttendanceSchedule,
  createFullAttendanceSchedule,
} from "./constants/campSchedule";

import HeroCard from "./components/HeroCard";
import AddCamperCard from "./components/AddCamperCard";
import PaymentSummary from "./components/PaymentSummary";
import RegisteredCampersTable from "./components/RegisteredCampersTable";

function App() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const { user, signOut } = useAuthenticator();

  const [campers, setCampers] = useState<Camper[]>([]);
  const [familyName, setFamilyName] = useState<string>("");

  const [camperFirstName, setCamperFirstName] = useState("");
  const [camperLastName, setCamperLastName] = useState("");
  const [camperType, setCamperType] = useState<CamperType>("ATHLETE");
  const [shirtSize, setShirtSize] = useState<Size>("M");
  const [sweatshirtSize, setSweatshirtSize] = useState<Size>("M");
  const [specialDietaryNeeds, setSpecialDietaryNeeds] = useState("");
  const [showAddCamper, setShowAddCamper] = useState(false);

  const [attendingFullCamp, setAttendingFullCamp] = useState(true);
  const [attendanceSchedule, setAttendanceSchedule] =
    useState<AttendanceSchedule>(() => createFullAttendanceSchedule());

  const [isDriver, setIsDriver] = useState(false);
  const [emptySeatsToCamp, setEmptySeatsToCamp] = useState(0);
  const [emptySeatsFromCamp, setEmptySeatsFromCamp] = useState(0);
  const [emptySeatsDuringCamp, setEmptySeatsDuringCamp] = useState(0);

  const canBeDriver =
    camperType === "PARENT" || camperType === "NON_PARENT_ADULT_ALUMNI";

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
      error: (error) => {
        console.error("Observe campers error:", error);
      },
    });

    return () => sub.unsubscribe();
  }, [client]);

  function resetCamperForm() {
    setCamperFirstName("");
    setCamperLastName("");
    setCamperType("ATHLETE");
    setShirtSize("M");
    setSweatshirtSize("M");
    setSpecialDietaryNeeds("");
    setShowAddCamper(false);

    setAttendingFullCamp(true);
    setAttendanceSchedule(createFullAttendanceSchedule());

    setIsDriver(false);
    setEmptySeatsToCamp(0);
    setEmptySeatsFromCamp(0);
    setEmptySeatsDuringCamp(0);
  }

  async function createCamper(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!camperFirstName.trim() || !camperLastName.trim()) {
      alert("Please enter the camper's first and last name.");
      return;
    }

    const newCamper = {
      camper_first_name: camperFirstName.trim(),
      camper_last_name: camperLastName.trim(),
      camper_type: camperType,
      shirt_size: shirtSize,
      sweatshirt_size: sweatshirtSize,
      special_dietary_needs: specialDietaryNeeds.trim() || undefined,

      attending_full_camp: attendingFullCamp,
      attendance_schedule: JSON.stringify(
        attendingFullCamp ? createFullAttendanceSchedule() : attendanceSchedule
      ),

      is_driver: canBeDriver ? isDriver : false,
      empty_seats_to_camp: canBeDriver && isDriver ? emptySeatsToCamp : 0,
      empty_seats_from_camp: canBeDriver && isDriver ? emptySeatsFromCamp : 0,
      empty_seats_during_camp: canBeDriver && isDriver ? emptySeatsDuringCamp : 0,
    };

    console.log("Trying to create camper:", newCamper);

    try {
      const { data, errors } = await client.models.Camper.create(newCamper);

      if (errors) {
        console.error("Camper create errors:", errors);
        alert(
          "There was a problem saving this camper. Check the console for details."
        );
        return;
      }

      console.log("Camper created successfully:", data);
      resetCamperForm();
    } catch (error) {
      console.error("Unexpected error creating camper:", error);
      alert("Unexpected error saving camper. Check the console for details.");
    }
  }

  async function deleteCamper(id: string) {
    try {
      const { errors } = await client.models.Camper.delete({ id });

      if (errors) {
        console.error("Camper delete errors:", errors);
        alert("There was a problem deleting this camper.");
      }
    } catch (error) {
      console.error("Error deleting camper:", error);
    }
  }

  function toggleAttendanceMeal(mealId: string) {
    setAttendanceSchedule((current) => ({
      ...current,
      [mealId]: !current[mealId],
    }));
  }

  function handleFullCampChange(isFullCamp: boolean) {
    setAttendingFullCamp(isFullCamp);

    if (isFullCamp) {
      setAttendanceSchedule(createFullAttendanceSchedule());
    }
  }

  function handleCamperTypeChange(newType: CamperType) {
    setCamperType(newType);

    const newTypeCanDrive =
      newType === "PARENT" || newType === "NON_PARENT_ADULT_ALUMNI";

    if (!newTypeCanDrive) {
      setIsDriver(false);
      setEmptySeatsToCamp(0);
      setEmptySeatsFromCamp(0);
      setEmptySeatsDuringCamp(0);
    }
  }

  return (
    <main className="app-shell">
      <HeroCard
        email={user?.signInDetails?.loginId}
        familyName={familyName}
        onSignOut={signOut}
      />

      <AddCamperCard
        showAddCamper={showAddCamper}
        setShowAddCamper={setShowAddCamper}
        createCamper={createCamper}
        camperFirstName={camperFirstName}
        setCamperFirstName={setCamperFirstName}
        camperLastName={camperLastName}
        setCamperLastName={setCamperLastName}
        camperType={camperType}
        handleCamperTypeChange={handleCamperTypeChange}
        shirtSize={shirtSize}
        setShirtSize={setShirtSize}
        sweatshirtSize={sweatshirtSize}
        setSweatshirtSize={setSweatshirtSize}
        specialDietaryNeeds={specialDietaryNeeds}
        setSpecialDietaryNeeds={setSpecialDietaryNeeds}
        canBeDriver={canBeDriver}
        isDriver={isDriver}
        setIsDriver={setIsDriver}
        emptySeatsToCamp={emptySeatsToCamp}
        setEmptySeatsToCamp={setEmptySeatsToCamp}
        emptySeatsFromCamp={emptySeatsFromCamp}
        setEmptySeatsFromCamp={setEmptySeatsFromCamp}
        emptySeatsDuringCamp={emptySeatsDuringCamp}
        setEmptySeatsDuringCamp={setEmptySeatsDuringCamp}
        attendingFullCamp={attendingFullCamp}
        handleFullCampChange={handleFullCampChange}
        attendanceSchedule={attendanceSchedule}
        toggleAttendanceMeal={toggleAttendanceMeal}
      />

      <section className="card">
        <PaymentSummary campers={campers} />

        <RegisteredCampersTable
          campers={campers}
          deleteCamper={deleteCamper}
        />
      </section>
    </main>
  );
}

export default App;