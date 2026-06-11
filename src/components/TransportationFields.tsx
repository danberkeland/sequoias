type TransportationFieldsProps = {
  isDriver: boolean;
  setIsDriver: (value: boolean) => void;
  emptySeatsToCamp: number;
  setEmptySeatsToCamp: (value: number) => void;
  emptySeatsFromCamp: number;
  setEmptySeatsFromCamp: (value: number) => void;
  emptySeatsDuringCamp: number;
  setEmptySeatsDuringCamp: (value: number) => void;
};

function TransportationFields({
  isDriver,
  setIsDriver,
  emptySeatsToCamp,
  setEmptySeatsToCamp,
  emptySeatsFromCamp,
  setEmptySeatsFromCamp,
  emptySeatsDuringCamp,
  setEmptySeatsDuringCamp,
}: TransportationFieldsProps) {
  function clearSeatCounts() {
    setEmptySeatsToCamp(0);
    setEmptySeatsFromCamp(0);
    setEmptySeatsDuringCamp(0);
  }

  return (
    <div className="field field-full driving-panel">
      <span>Transportation</span>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isDriver}
          onChange={(event) => {
            const checked = event.target.checked;
            setIsDriver(checked);

            if (!checked) {
              clearSeatCounts();
            }
          }}
        />
        <span>I am planning to drive</span>
      </label>

      {isDriver && (
        <div className="driving-grid">
          <label className="field">
            <span>Empty seats going up to camp</span>
            <input
              type="number"
              min="0"
              max="15"
              value={emptySeatsToCamp}
              onChange={(event) =>
                setEmptySeatsToCamp(Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Empty seats coming home</span>
            <input
              type="number"
              min="0"
              max="15"
              value={emptySeatsFromCamp}
              onChange={(event) =>
                setEmptySeatsFromCamp(Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Empty seats while at camp</span>
            <input
              type="number"
              min="0"
              max="15"
              value={emptySeatsDuringCamp}
              onChange={(event) =>
                setEmptySeatsDuringCamp(Number(event.target.value))
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default TransportationFields;