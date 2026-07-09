import type { FamilyGroup } from "../../utils/adminFamilies";
import type { FamilyStatusField } from "../../hooks/useCamperStatusUpdates";

type FamilyGroupHeaderRowProps = {
  family: FamilyGroup;
  columnCount: number;
  isFamilyStatusChecked: (
    familyCampers: FamilyGroup["campers"],
    field: FamilyStatusField
  ) => boolean;
  updateFamilyStatus: (
    familyCampers: FamilyGroup["campers"],
    field: FamilyStatusField,
    checked: boolean
  ) => Promise<void>;
};

export function FamilyGroupHeaderRow({
  family,
  columnCount,
  isFamilyStatusChecked,
  updateFamilyStatus,
}: FamilyGroupHeaderRowProps) {
  return (
    <tr className="family-group-row">
      <td colSpan={columnCount}>
        <div className="family-group-header">
          <div>
            <strong>{family.name}</strong>

            <span className="family-member-count">
              {family.campers.length === 1
                ? "1 registered member"
                : `${family.campers.length} registered members`}
            </span>
          </div>

          <div className="family-group-statuses">
            <label>
              <input
                type="checkbox"
                checked={isFamilyStatusChecked(
                  family.campers,
                  "isSLDCfee"
                )}
                onChange={(event) =>
                  updateFamilyStatus(
                    family.campers,
                    "isSLDCfee",
                    event.target.checked
                  )
                }
              />

              <span>SLDC Fee</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isFamilyStatusChecked(
                  family.campers,
                  "isCampAccept"
                )}
                onChange={(event) =>
                  updateFamilyStatus(
                    family.campers,
                    "isCampAccept",
                    event.target.checked
                  )
                }
              />

              <span>Camp Accepted</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isFamilyStatusChecked(
                  family.campers,
                  "isCampFee"
                )}
                onChange={(event) =>
                  updateFamilyStatus(
                    family.campers,
                    "isCampFee",
                    event.target.checked
                  )
                }
              />

              <span>Camp Fee</span>
            </label>
          </div>
        </div>
      </td>
    </tr>
  );
}