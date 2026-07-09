import type { CampBirthday } from "../../utils/adminBirthdays";

type CampBirthdaysCardProps = {
  campBirthdays: CampBirthday[];
};

export function CampBirthdaysCard({
  campBirthdays,
}: CampBirthdaysCardProps) {
  return (
    <section className="card camp-birthdays-card">
      <div className="section-header">
        <div>
          <h2>Camp Birthdays</h2>

          <p>
            Registered campers with birthdays between July 26
            and August 2
          </p>
        </div>

        <span className="birthday-count">
          {campBirthdays.length}
        </span>
      </div>

      {campBirthdays.length === 0 ? (
        <div className="empty-state">
          <h3>No camp birthdays listed</h3>

          <p>
            No registered campers currently have birthdays
            during the camp dates.
          </p>
        </div>
      ) : (
        <ul className="camp-birthday-list">
          {campBirthdays.map((birthday) => (
            <li
              key={birthday.camper.id}
              className="camp-birthday-item"
            >
              <div>
                <strong>
                  {birthday.camper.camper_first_name}{" "}
                  {birthday.camper.camper_last_name}
                </strong>

                {birthday.camper.family_name && (
                  <span className="birthday-family-name">
                    {birthday.camper.family_name} Family
                  </span>
                )}
              </div>

              <span className="birthday-date">
                {birthday.displayDate}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}