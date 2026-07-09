type ApplicationStageCardProps = {
  isFinalPhase: boolean;
  settingsLoaded: boolean;
  isSavingPhase: boolean;
  changeApplicationPhase: (nextIsFinal: boolean) => void;
};

export function ApplicationStageCard({
  isFinalPhase,
  settingsLoaded,
  isSavingPhase,
  changeApplicationPhase,
}: ApplicationStageCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Application Stage</h2>

          <p>
            Control which portions of the camp application
            families can access.
          </p>
        </div>
      </div>

      {!settingsLoaded ? (
        <p>Loading application stage…</p>
      ) : (
        <div className="application-stage-panel">
          <div>
            <strong>
              {isFinalPhase
                ? "Final Application"
                : "Preliminary Interest Form"}
            </strong>

            <p>
              {isFinalPhase
                ? "Families can access all registration, waiver, and payment steps."
                : "Families can access only Step 1 to indicate interest in camp."}
            </p>
          </div>

          <label className="phase-switch">
            <span
              className={
                !isFinalPhase
                  ? "phase-label is-active"
                  : "phase-label"
              }
            >
              Preliminary
            </span>

            <input
              type="checkbox"
              checked={isFinalPhase}
              disabled={isSavingPhase}
              onChange={(event) =>
                changeApplicationPhase(event.target.checked)
              }
              aria-label="Switch application between preliminary and final"
            />

            <span className="phase-switch-slider" />

            <span
              className={
                isFinalPhase
                  ? "phase-label is-active"
                  : "phase-label"
              }
            >
              Final
            </span>
          </label>
        </div>
      )}
    </section>
  );
}