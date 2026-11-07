import { expect, it } from "vitest";
import { contributionPresentation } from "@/lib/product/contributionPresentation";
it("preserves losses as signed amounts rather than computing misleading pie shares",()=>{
 const result=contributionPresentation([{label:"Food",contribution:80},{label:"Delivery",contribution:-20}]);
 expect(result.mode).toBe("signed");expect(result.total).toBe(60);expect(result.products[1].contribution).toBe(-20);expect(result.products.every(p=>p.share===null)).toBe(true);
});
it("produces meaningful shares for positive categories and no percentages for zero totals",()=>{
 expect(contributionPresentation([{contribution:70},{contribution:30}]).products.map(p=>p.share)).toEqual([.7,.3]);
 expect(contributionPresentation([{contribution:0}]).products[0].share).toBeNull();
});
it("rejects non-finite data rather than drawing plausible-looking totals",()=>{
 expect(()=>contributionPresentation([{contribution:NaN}])).toThrow();
 expect(()=>contributionPresentation([{contribution:Infinity}])).toThrow();
});
