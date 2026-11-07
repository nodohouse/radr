/** Shared presentation rule; never invent freshness from a display-time string. */
export function evidenceNeedsReview(record: { confidence: { data: string }; evidenceRefs: readonly { grade?: string }[] }) {
 return record.confidence.data === "LOW" || record.evidenceRefs.length === 0 || record.evidenceRefs.some(ref => ["STALE","MISSING","UNKNOWN"].includes(ref.grade || ""));
}
