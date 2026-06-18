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
import JoinSLDC from "./components/JoinSLDC";
import SignCampWaiver from "./components/SignCampWaiver";
import PayCampFee from "./components/PayCampFee";
import CampInfo from "./components/CampInfo";

function parseCamperAttendance(
  value: Camper["attendance_schedule"]
): AttendanceSchedule {
  if (!value) {
    return createFullAttendanceSchedule();
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AttendanceSchedule;
    } catch (error) {
      console.error(
        "Could not parse camper attendance:",
        error
      );

      return createFullAttendanceSchedule();
    }
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as AttendanceSchedule;
  }

  return createFullAttendanceSchedule();
}

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
  const [editingCamperId, setEditingCamperId] =
  useState<string | null>(null);


  const [attendingFullCamp, setAttendingFullCamp] = useState(true);
  const [attendanceSchedule, setAttendanceSchedule] =
    useState<AttendanceSchedule>(() => createFullAttendanceSchedule());

  const [isDriver, setIsDriver] = useState(false);
  const [emptySeatsToCamp, setEmptySeatsToCamp] = useState(0);
  const [emptySeatsFromCamp, setEmptySeatsFromCamp] = useState(0);
  const [emptySeatsDuringCamp, setEmptySeatsDuringCamp] = useState(0);
  const [showCampInfo, setShowCampInfo] = useState(false);
  const [showJoinSLDC, setShowJoinSLDC] = useState(false);
  const [showSignCampWaiver, setShowSignCampWaiver] = useState(false);
  const [showPayCampFee, setShowPayCampFee] = useState(false);
 



  const canBeDriver =
    camperType === "COACH" || camperType === "PARENT" || camperType === "NON_PARENT_ADULT_ALUMNI";

  useEffect(() => {
    if (!familyName.trim() || campers.length === 0) {
      return;
    }

    const campersMissingFamilyName = campers.filter(
      (camper) => !camper.family_name
    );

    if (campersMissingFamilyName.length === 0) {
      return;
    }

    Promise.all(
      campersMissingFamilyName.map((camper) =>
        client.models.Camper.update({
          id: camper.id,
          family_name: familyName.trim(),
        })
      )
    ).catch((error) => {
      console.error("Could not backfill family name:", error);
    });
  }, [campers, client, familyName]);

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
  const currentUserSub = user?.userId;

  if (!currentUserSub) {
    setCampers([]);
    return;
  }

  const subscription =
    client.models.Camper.observeQuery({
      filter: {
        owner: {
          beginsWith: `${currentUserSub}::`,
        },
      },
      authMode: "userPool",
    }).subscribe({
      next: ({ items }) => {
        setCampers([...items]);
      },

      error: (error) => {
        console.error(
          "Family camper query error:",
          error
        );

        setCampers([]);
      },
    });

  return () => {
    subscription.unsubscribe();
  };
}, [client, user?.userId]);

function editCamper(camper: Camper) {
  const savedCamperType =
    (camper.camper_type ?? "ATHLETE") as CamperType;

  const camperCanDrive =
    savedCamperType === "COACH" ||
    savedCamperType === "PARENT" ||
    savedCamperType ===
      "NON_PARENT_ADULT_ALUMNI";

  setEditingCamperId(camper.id);

  setCamperFirstName(
    camper.camper_first_name ?? ""
  );

  setCamperLastName(
    camper.camper_last_name ?? ""
  );

  setCamperType(savedCamperType);

  setShirtSize(
    (camper.shirt_size ?? "M") as Size
  );

  setSweatshirtSize(
    (camper.sweatshirt_size ?? "M") as Size
  );

  setSpecialDietaryNeeds(
    camper.special_dietary_needs ?? ""
  );

  const isFullCamp =
    camper.attending_full_camp ?? true;

  setAttendingFullCamp(isFullCamp);

  setAttendanceSchedule(
    isFullCamp
      ? createFullAttendanceSchedule()
      : parseCamperAttendance(
          camper.attendance_schedule
        )
  );

  setIsDriver(
    camperCanDrive &&
      (camper.is_driver ?? false)
  );

  setEmptySeatsToCamp(
    camper.empty_seats_to_camp ?? 0
  );

  setEmptySeatsFromCamp(
    camper.empty_seats_from_camp ?? 0
  );

  setEmptySeatsDuringCamp(
    camper.empty_seats_during_camp ?? 0
  );

  setShowAddCamper(true);

  requestAnimationFrame(() => {
    document
      .getElementById("camper-form-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  });
}

  function resetCamperForm() {
  setCamperFirstName("");
  setCamperLastName("");
  setCamperType("ATHLETE");
  setShirtSize("M");
  setSweatshirtSize("M");
  setSpecialDietaryNeeds("");

  setAttendingFullCamp(true);
  setAttendanceSchedule(
    createFullAttendanceSchedule()
  );

  setIsDriver(false);
  setEmptySeatsToCamp(0);
  setEmptySeatsFromCamp(0);
  setEmptySeatsDuringCamp(0);

  setEditingCamperId(null);
  setShowAddCamper(false);
}
  async function saveCamper(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (
    !camperFirstName.trim() ||
    !camperLastName.trim()
  ) {
    alert(
      "Please enter the camper's first and last name."
    );
    return;
  }

  const camperData = {
    camper_first_name: camperFirstName.trim(),
    camper_last_name: camperLastName.trim(),
    camper_type: camperType,
    shirt_size: shirtSize,
    sweatshirt_size: sweatshirtSize,

    // Null allows an existing value to be cleared.
    special_dietary_needs:
      specialDietaryNeeds.trim() || null,

    attending_full_camp: attendingFullCamp,

    attendance_schedule: JSON.stringify(
      attendingFullCamp
        ? createFullAttendanceSchedule()
        : attendanceSchedule
    ),

    is_driver: canBeDriver ? isDriver : false,

    empty_seats_to_camp:
      canBeDriver && isDriver
        ? emptySeatsToCamp
        : 0,

    empty_seats_from_camp:
      canBeDriver && isDriver
        ? emptySeatsFromCamp
        : 0,

    empty_seats_during_camp:
      canBeDriver && isDriver
        ? emptySeatsDuringCamp
        : 0,
  };

  try {
    const result = editingCamperId
      ? await client.models.Camper.update({
          id: editingCamperId,
          ...camperData,
        })
      : await client.models.Camper.create({
          ...camperData,
          family_name:
            familyName.trim() || undefined,
        });

    if (result.errors?.length) {
      console.error(
        editingCamperId
          ? "Camper update errors:"
          : "Camper create errors:",
        result.errors
      );

      alert(
        editingCamperId
          ? "There was a problem updating this camper."
          : "There was a problem saving this camper."
      );

      return;
    }

    console.log(
      editingCamperId
        ? "Camper updated successfully:"
        : "Camper created successfully:",
      result.data
    );

    resetCamperForm();
  } catch (error) {
    console.error(
      editingCamperId
        ? "Unexpected camper update error:"
        : "Unexpected camper create error:",
      error
    );

    alert(
      editingCamperId
        ? "Unexpected error updating camper."
        : "Unexpected error saving camper."
    );
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
  newType === "COACH" ||
  newType === "PARENT" ||
  newType === "NON_PARENT_ADULT_ALUMNI";

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
  campers={campers}
  editCamper={editCamper}
  deleteCamper={deleteCamper}

  editingCamperId={editingCamperId}
  resetCamperForm={resetCamperForm}

  showAddCamper={showAddCamper}
  setShowAddCamper={setShowAddCamper}

  saveCamper={saveCamper}

  camperFirstName={camperFirstName}
  setCamperFirstName={setCamperFirstName}

  camperLastName={camperLastName}
  setCamperLastName={setCamperLastName}

  camperType={camperType}
  handleCamperTypeChange={
    handleCamperTypeChange
  }

  shirtSize={shirtSize}
  setShirtSize={setShirtSize}

  sweatshirtSize={sweatshirtSize}
  setSweatshirtSize={setSweatshirtSize}

  specialDietaryNeeds={
    specialDietaryNeeds
  }
  setSpecialDietaryNeeds={
    setSpecialDietaryNeeds
  }

  canBeDriver={canBeDriver}
  isDriver={isDriver}
  setIsDriver={setIsDriver}

  emptySeatsToCamp={emptySeatsToCamp}
  setEmptySeatsToCamp={
    setEmptySeatsToCamp
  }

  emptySeatsFromCamp={
    emptySeatsFromCamp
  }
  setEmptySeatsFromCamp={
    setEmptySeatsFromCamp
  }

  emptySeatsDuringCamp={
    emptySeatsDuringCamp
  }
  setEmptySeatsDuringCamp={
    setEmptySeatsDuringCamp
  }

  attendingFullCamp={attendingFullCamp}
  handleFullCampChange={
    handleFullCampChange
  }

  attendanceSchedule={attendanceSchedule}
  toggleAttendanceMeal={
    toggleAttendanceMeal
  }
/>
      <JoinSLDC
        campers={campers}
        showJoinSLDC={showJoinSLDC}
        setShowJoinSLDC={setShowJoinSLDC} />
      <SignCampWaiver
        campers={campers}
        showSignCampWaiver={showSignCampWaiver}
        setShowSignCampWaiver={setShowSignCampWaiver}
      />
      <PayCampFee
        campers={campers}
        familyName={familyName}
        showPayCampFee={showPayCampFee}
        setShowPayCampFee={setShowPayCampFee}
      />
      <CampInfo
        showCampInfo={showCampInfo}
        setShowCampInfo={setShowCampInfo}
      />



    </main>
  );
}

export default App;