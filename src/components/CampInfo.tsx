import packingListPdf from "../pdfs/2026_Camp_Pack_List.pdf";
import itineraryPdf from "../pdfs/2026_Running_Camp_Schedule.pdf";

type AddCampInfoProps = {
  showCampInfo: boolean;
  setShowCampInfo: (value: boolean | ((current: boolean) => boolean)) => void;
};

const campInfoLinks = [
  {
    label: "Camp Packing List",
    href: packingListPdf,
  },
  {
    label: "Camp Itinerary",
    href: itineraryPdf,
  },
  {
    label: "Camp Map",
    href: "#",
  },
  {
    label: "Emergency Contact Info",
    href: "#",
  },
];

function CampInfo({
  showCampInfo,
  setShowCampInfo,
}: AddCampInfoProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h1>Step 5</h1>
          <br />
          <h2>Prepare to Camp</h2>
          <p>What to pack, Itinerary, Maps, Contact Info.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowCampInfo((current) => !current)}
        >
          {showCampInfo ? "Close" : "+ Camp Info"}
        </button>
      </div>

      {showCampInfo && (
        <div className="camp-info-links">
          <h3>Camp Documents</h3>

          <ul>
            {campInfoLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default CampInfo;