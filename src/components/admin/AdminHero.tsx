import { Link } from "react-router-dom";

type AdminHeroProps = {
  loginId?: string;
  signOut: () => void;
};

export function AdminHero({
  loginId,
  signOut,
}: AdminHeroProps) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Sequoias Camp</p>
        <h1>Administrator Dashboard</h1>
        <p className="subtitle">
          Review camper registrations, waivers, attendance, and payments.
        </p>
      </div>

      <div className="account-box">
        <p className="account-label">Administrator</p>
        <p className="account-email">{loginId}</p>

        <Link to="/" className="secondary-button">
          Family application
        </Link>

        <button className="secondary-button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </section>
  );
}