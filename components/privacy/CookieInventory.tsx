import { STORAGE_INVENTORY } from "@/lib/privacy/disclosures";
export function CookieInventory() {
  return (
    <div
      className="rt-inventory"
      role="region"
      aria-label="Cookies and browser storage inventory"
      tabIndex={0}
    >
      <table>
        <caption>
          Current application storage. Not every item is set on a marketing
          visit; authenticated and report cookies depend on using those
          features.
        </caption>
        <thead>
          <tr>
            <th scope="col">Name & provider</th>
            <th scope="col">Purpose</th>
            <th scope="col">Duration & use</th>
          </tr>
        </thead>
        <tbody>
          {STORAGE_INVENTORY.map((item) => (
            <tr key={item.name}>
              <th scope="row">
                <code>{item.name}</code>
                <span>{item.provider}</span>
                <small>
                  {item.type} · {item.category}
                </small>
              </th>
              <td>{item.purpose}</td>
              <td>
                <strong>{item.duration}</strong>
                <span>{item.when}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
