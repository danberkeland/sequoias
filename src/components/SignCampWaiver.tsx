

type AddSignCampWaiverProps = {
  showSignCampWaiver: boolean;
  setShowSignCampWaiver: (value: boolean | ((current: boolean) => boolean)) => void;

};

function SignCampWaiver({
  showSignCampWaiver,
  setShowSignCampWaiver,
}: AddSignCampWaiverProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 3</h1>
          <br></br>
          <h2>Sign Camp Waiver</h2>
          <p>
            {showSignCampWaiver
              ? "Sign Sequoia Camp Waiver."
              : "Sign waiver for individual or for whole family."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowSignCampWaiver((current) => !current)}
        >
          {showSignCampWaiver ? "Close" : "+ Sign Camp Waiver"}
        </button>
      </div>

    </section>
  );
}

export default SignCampWaiver;