import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

type Client = ReturnType<typeof generateClient<Schema>>;

type Camper = Schema["Camper"]["type"];
type SLDCApplication = Schema["SLDCApplication"]["type"];
type CampWaiver = Schema["CampWaiver"]["type"];

export function useAdminCampData(client: Client) {
  const [campers, setCampers] = useState<Camper[]>([]);
  const [applications, setApplications] = useState<SLDCApplication[]>([]);
  const [campWaivers, setCampWaivers] = useState<CampWaiver[]>([]);

  useEffect(() => {
    const camperSubscription = client.models.Camper.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        console.log("Camper observer:", {
          isSynced,
          campers: items.map((camper) => ({
            id: camper.id,
            isSLDCmember: camper.isSLDCmember,
            isSLDCfee: camper.isSLDCfee,
            isCampAccept: camper.isCampAccept,
            isCampFee: camper.isCampFee,
            isCampWaiver: camper.isCampWaiver,
          })),
        });

        // Do not overwrite the optimistic checkbox state
        // with an earlier local snapshot.
        if (!isSynced) {
          return;
        }

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

    const campWaiverSubscription =
      client.models.CampWaiver.observeQuery().subscribe({
        next: ({ items }) => {
          setCampWaivers([...items]);
        },
        error: (error) => {
          console.error("Admin camp waiver query error:", error);
        },
      });

    return () => {
      camperSubscription.unsubscribe();
      applicationSubscription.unsubscribe();
      campWaiverSubscription.unsubscribe();
    };
  }, [client]);

  return {
    campers,
    setCampers,
    applications,
    campWaivers,
  };
}
