/** A pie is unsuitable for signed category losses; preserve those amounts explicitly. */
export function contributionPresentation<T extends { contribution: number }>(products: T[]) {
  if (products.some(p => !Number.isFinite(p.contribution))) throw new Error("Contribution is unavailable; inspect the source data.");
  const mode = products.some(p => p.contribution < 0) ? "signed" : "share";
  const total = products.reduce((sum,p)=>sum+p.contribution,0);
  return { mode, total, products: products.map(p=>({...p,share:mode==="share"&&total>0?p.contribution/total:null})) };
}
