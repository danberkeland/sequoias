import { generateClient } from "aws-amplify/data";
import type { Dispatch, SetStateAction } from "react";
import type { Schema } from "../../amplify/data/resource";

type Client = ReturnType<typeof generateClient<Schema>>;
type Camper = Schema["Camper"]["type"];

export type CamperStatusUpdate = {
  isSLDCmember?: boolean;
  isSLDCfee?: boolean;
  isCampAccept?: boolean;
  isCampFee?: boolean;
  isCampWaiver?: boolean;
};

export type FamilyStatusField =
  | "isSLDCfee"
  | "isCampAccept"
  | "isCampFee";

export function useCamperStatusUpdates(
  client: Client,
  campers: Camper[],
  setCampers: Dispatch<SetStateAction<Camper[]>>
) {
  function isFamilyStatusChecked(
    familyCampers: Camper[],
    field: FamilyStatusField
  ) {
    return (
      familyCampers.length > 0 &&
      familyCampers.every((camper) => camper[field] === true)
    );
  }

  async function updateFamilyStatus(
    familyCampers: Camper[],
    field: FamilyStatusField,
    checked: boolean
  ) {
    const updates: CamperStatusUpdate = {
      [field]: checked,
    };

    await Promise.all(
      familyCampers.map((camper) =>
        updateCamperStatus(camper.id, updates)
      )
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

    setCampers((currentCampers) =>
      currentCampers.map((camper) =>
        camper.id === camperId
          ? ({ ...camper, ...updates } as Camper)
          : camper
      )
    );

    try {
      const { data, errors } =
        await client.models.Camper.update({
          id: camperId,
          ...updates,
        });

      if (errors?.length) {
        console.error("Camper status update errors:", errors);

        setCampers((currentCampers) =>
          currentCampers.map((camper) =>
            camper.id === camperId ? originalCamper : camper
          )
        );

        alert("There was a problem updating the camper status.");
        return;
      }

      console.log("Camper status updated:", data);
    } catch (error) {
      console.error("Unexpected camper status update error:", error);

      setCampers((currentCampers) =>
        currentCampers.map((camper) =>
          camper.id === camperId ? originalCamper : camper
        )
      );

      alert("Unexpected error updating camper status.");
    }
  }

  return {
    updateCamperStatus,
    updateFamilyStatus,
    isFamilyStatusChecked,
  };
}