import type {
  ApparelSizeRow,
  ApparelSizeTotals,
} from "../../utils/adminApparel";

type ApparelSizeTotalsCardProps = {
  apparelSizeTotals: ApparelSizeTotals;
};

function renderSizeTable(
  title: string,
  rows: ApparelSizeRow[]
) {
  return (
    <div className="apparel-size-table-block">
      <h3>{title}</h3>

      {rows.length === 0 ? (
        <p className="apparel-size-empty">
          No sizes submitted yet.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="apparel-size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Athlete</th>
                <th>Sibling</th>
                <th>Rest</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.size}>
                  <th scope="row">{row.size}</th>
                  <td>{row.athlete}</td>
                  <td>{row.sibling}</td>
                  <td>{row.rest}</td>
                  <td>
                    <strong>{row.total}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ApparelSizeTotalsCard({
  apparelSizeTotals,
}: ApparelSizeTotalsCardProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Shirt & Sweatshirt Size Totals</h2>
          <p>
            Size totals broken down by athlete, sibling, and rest
          </p>
        </div>
      </div>

      <div className="apparel-size-grid">
        {renderSizeTable(
          "T-Shirts",
          apparelSizeTotals.shirtRows
        )}

        {renderSizeTable(
          "Sweatshirts",
          apparelSizeTotals.sweatshirtRows
        )}
      </div>
    </section>
  );
}