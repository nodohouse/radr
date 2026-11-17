import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";

/** Wait for the saved world and scope rather than flashing another venue's data. */
export function WorkspacePending() {
  return <main className="rp-workspace-pending" aria-busy="true">
    <div className="rp-pending-brand" role="status" aria-label="Opening your workspace">
      <FrozenRadrLogo variant="mark" theme="light" width={40} priority />
      <span>Opening your workspace</span>
    </div>
    <div className="rp-pending-preview" aria-hidden="true">
      <div className="rp-pending-heading" />
      <div className="rp-pending-metrics">{[0, 1, 2, 3].map(i => <i key={i} />)}</div>
      <div className="rp-pending-panels"><i /><i /></div>
    </div>
  </main>;
}
