type HeroCardProps = {
  email?: string;
  familyName: string;
  onSignOut: () => void;
};

function HeroCard({ email, familyName, onSignOut }: HeroCardProps) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">SLDC Sequoias Running Camp (Sunday, July 26 -  Sunday, August 2)</p>
        <h1>My Application</h1>
        <p className="subtitle">
          Add campers, Join SLDC, Sign Waivers, Pay Fees, prepare for THE HUMP!
        </p>
      </div>

      <div className="account-box">
        <p className="account-label">Signed in as</p>
        <p className="account-email">{email}</p>

        {familyName && (
          <p className="family-name">
            Family: <strong>{familyName}</strong>
          </p>
        )}

        <button className="secondary-button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </section>
  );
}

export default HeroCard;