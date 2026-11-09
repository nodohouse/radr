/** Browser tabs use the brand alone; route context remains in the visible heading. */
export function appPageTitle(path: string): string {
  void path; // Keep the shared route-metadata call signature.
  return "RADR";
}
