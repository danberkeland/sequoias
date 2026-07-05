import { Link } from "react-router-dom";
import "../App.css";

function CampInfoPage() {
  return (
    <main className="app-shell camp-info-page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">San Luis Distance Club</p>

          <h1>Sequoia Running Camp</h1>

          <p className="subtitle">
            Camp location and emergency contact information.
          </p>
        </div>

        <div className="camp-info-hero-actions">
          <Link to="/" className="secondary-button">
            Camp Registration
          </Link>
        </div>
      </section>

      <section className="card camp-info-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Camp Location</p>
            <h2>Fir Group Campground</h2>
          </div>
        </div>

        <div className="camp-info-location">
          <p>
            The San Luis Distance Club Sequoia Running Camp is based at
            <strong> Fir Group Campground</strong>, a rustic tent campground
            in Sequoia National Forest.
          </p>

          <p>
            The campground is directly across the street from
            <strong> Stony Creek Lodge</strong>, where there is a general
            store and gas station.
          </p>

          <div className="camp-info-callout">
            <strong>Important:</strong> Cell service at the campground is very
            limited.
          </div>

          <dl className="camp-info-details">
            <div>
              <dt>Campground reference for emergencies</dt>
              <dd>Fir Group Campground near Stony Creek Lodge</dd>
            </div>

            <div>
              <dt>Nearby cell or Wi-Fi access</dt>
              <dd>Wolverton — approximately 20 minutes away</dd>
            </div>

            <div>
              <dt>Additional nearby connectivity</dt>
              <dd>Hume Lake — approximately 45 minutes away</dd>
            </div>
          </dl>
          <div className="camp-map-section">
  <div className="camp-map-header">
    <div>
      <p className="eyebrow">Map & Directions</p>
      <h3>Fir Group Campground</h3>
    </div>

    <a
      href="https://www.google.com/maps/dir/?api=1&destination=Fir+Group+Campground%2C+Sequoia+National+Forest%2C+California"
      target="_blank"
      rel="noreferrer"
      className="secondary-button"
    >
      Open Directions
    </a>
  </div>

  <div className="camp-map-frame">
    <iframe
      title="Map to Fir Group Campground near Stony Creek Lodge"
      src="https://maps.google.com/maps?q=Fir+Group+Campground%2C+Sequoia+National+Forest%2C+California&t=&z=14&ie=UTF8&iwloc=&output=embed"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  </div>

  <p className="camp-map-note">
    Camp is located at Fir Group Campground, directly across the street from
    Stony Creek Lodge.
  </p>
</div>
        </div>
      </section>

      <section className="card camp-info-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Emergency Contact</p>
            <h2>Who to Call</h2>
          </div>
        </div>

        <div className="camp-info-emergency-intro">
          <p>
            For an immediate, life-threatening emergency, call <strong>911</strong>.
            For park or campground emergencies, contact Park Dispatch and clearly
            identify the camp location.
          </p>
        </div>

        <div className="camp-info-contact-grid">
          <article className="camp-info-contact camp-info-contact-primary">
            <p className="camp-info-contact-label">Park Dispatch / Ranger</p>

            <a className="camp-info-phone" href="tel:5595653195">
              (559) 565-3195
            </a>

            <p>
              Reference <strong>Fir Group Campground near Stony Creek Lodge</strong>{" "}
              and provide clear details about the emergency and your location.
            </p>
          </article>

          <article className="camp-info-contact">
            <p className="camp-info-contact-label">Coach Dan Berkeland</p>

            <a className="camp-info-phone" href="tel:6612108811">
              (661) 210-8811
            </a>
          </article>

          <article className="camp-info-contact">
            <p className="camp-info-contact-label">Coach Nancy Steinmaus</p>

            <a className="camp-info-phone" href="tel:8055504764">
              (805) 550-4764
            </a>
          </article>
        </div>

        <div className="camp-info-callout">
          Coaches will check messages when possible near Stony Creek Lodge or
          during supply runs, but messages may not be seen immediately because
          reception at camp is limited.
        </div>
      </section>
    </main>
  );
}

export default CampInfoPage;