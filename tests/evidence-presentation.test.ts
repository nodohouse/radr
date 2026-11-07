import {expect,it} from "vitest";
import {evidenceNeedsReview} from "@/lib/product/evidencePresentation";
it("flags low-confidence, missing and degraded evidence consistently",()=>{
 expect(evidenceNeedsReview({confidence:{data:"HIGH"},evidenceRefs:[]})).toBe(true);
 expect(evidenceNeedsReview({confidence:{data:"LOW"},evidenceRefs:[{grade:"FRESH"}]})).toBe(true);
 for(const grade of ["STALE","MISSING","UNKNOWN"])expect(evidenceNeedsReview({confidence:{data:"HIGH"},evidenceRefs:[{grade}]})).toBe(true);
 expect(evidenceNeedsReview({confidence:{data:"HIGH"},evidenceRefs:[{grade:"FRESH"}]})).toBe(false);
});
