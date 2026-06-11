

type AddCampInfoProps = {
  showCampInfo: boolean;
  setShowCampInfo: (value: boolean | ((current: boolean) => boolean)) => void;

};

function CampInfo({
  showCampInfo,
  setShowCampInfo,
}: AddCampInfoProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 5</h1>
          <br></br>
          <h2>Prepare to Camp</h2>
          <p>
            {showCampInfo
              ? "What to pack, Itinerary, Maps, Contact Info."
              : "What to pack, Itinerary, Maps, Contact Info."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowCampInfo((current) => !current)}
        >
          {showCampInfo ? "Close" : "+ Camp Info"}
        </button>
      </div>

    </section>
  );
}

export default CampInfo;