

type AddPayCampFeeProps = {
  showPayCampFee: boolean;
  setShowPayCampFee: (value: boolean | ((current: boolean) => boolean)) => void;

};

function PayCampFee({
  showPayCampFee,
  setShowPayCampFee,
}: AddPayCampFeeProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 4</h1>
          <br></br>
          <h2>Pay Camp Fee</h2>
          <p>
            {showPayCampFee
              ? "Complete payment of camp fee."
              : "Complete payment of camp fee."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowPayCampFee((current) => !current)}
        >
          {showPayCampFee ? "Close" : "+ PayCampFee"}
        </button>
      </div>

    </section>
  );
}

export default PayCampFee;