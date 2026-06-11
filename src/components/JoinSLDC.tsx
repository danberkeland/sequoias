

type AddSLDCCardProps = {
  showJoinSLDC: boolean;
  setShowJoinSLDC: (value: boolean | ((current: boolean) => boolean)) => void;

};

function JoinSLDC({
  showJoinSLDC,
  setShowJoinSLDC,
}: AddSLDCCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 2</h1>
          <br></br>
          <h2>Join San Luis Distance Club</h2>
          <p>
            {showJoinSLDC
              ? "Complete SLDC App and Waiver for each camper."
              : "Only one SLDC membership required per family, but each member must complete waiver."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowJoinSLDC((current) => !current)}
        >
          {showJoinSLDC ? "Close" : "+ JoinSLDC"}
        </button>
      </div>

    </section>
  );
}

export default JoinSLDC;