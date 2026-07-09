import { useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const APP_SETTINGS_ID = "camp-registration-settings";

export function useApplicationStage() {
  const client = useMemo(() => generateClient<Schema>(), []);

  const [isFinalPhase, setIsFinalPhase] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isSavingPhase, setIsSavingPhase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAppSettings() {
      try {
        const { data, errors } =
          await client.models.AppSettings.get(
            {
              id: APP_SETTINGS_ID,
            },
            {
              authMode: "userPool",
            }
          );

        if (errors?.length) {
          console.error(
            "App settings query errors:",
            errors
          );
        }

        if (cancelled) {
          return;
        }

        if (data) {
          setIsFinalPhase(data.is_final ?? false);
          setSettingsLoaded(true);
          return;
        }

        /*
         * The record does not exist yet.
         * Create it in preliminary mode.
         */
        const createResult =
          await client.models.AppSettings.create(
            {
              id: APP_SETTINGS_ID,
              is_final: false,
            },
            {
              authMode: "userPool",
            }
          );

        if (createResult.errors?.length) {
          console.error(
            "App settings create errors:",
            createResult.errors
          );

          return;
        }

        if (!cancelled) {
          setIsFinalPhase(
            createResult.data?.is_final ?? false
          );

          setSettingsLoaded(true);
        }
      } catch (error) {
        console.error(
          "Could not load app settings:",
          error
        );
      }
    }

    loadAppSettings();

    return () => {
      cancelled = true;
    };
  }, [client]);

  async function changeApplicationPhase(
    nextIsFinal: boolean
  ) {
    const previousValue = isFinalPhase;

    setIsFinalPhase(nextIsFinal);
    setIsSavingPhase(true);

    try {
      const { data, errors } =
        await client.models.AppSettings.update(
          {
            id: APP_SETTINGS_ID,
            is_final: nextIsFinal,
          },
          {
            authMode: "userPool",
          }
        );

      if (errors?.length) {
        console.error(
          "Application phase update errors:",
          errors
        );

        setIsFinalPhase(previousValue);

        alert(
          "There was a problem changing the application phase."
        );

        return;
      }

      setIsFinalPhase(data?.is_final ?? nextIsFinal);
    } catch (error) {
      console.error(
        "Unexpected application phase update error:",
        error
      );

      setIsFinalPhase(previousValue);

      alert(
        "Unexpected error changing the application phase."
      );
    } finally {
      setIsSavingPhase(false);
    }
  }

  return {
    isFinalPhase,
    settingsLoaded,
    isSavingPhase,
    changeApplicationPhase,
  };
}