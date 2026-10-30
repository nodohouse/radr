/**
 * Continuous premium atmosphere — light fields only.
 * NO background signal lines / network spaghetti.
 */

export function RadrAtmosphere() {
  return (
    <div className="rx-home-atm" aria-hidden>
      <div className="rx-home-atm-base" />
      <div className="rx-home-atm-field rx-home-atm-field--hero-blue" />
      <div className="rx-home-atm-field rx-home-atm-field--hero-cyan" />
      <div className="rx-home-atm-field rx-home-atm-field--hero-green" />
      <div className="rx-home-atm-field rx-home-atm-field--mid-neutral" />
      <div className="rx-home-atm-field rx-home-atm-field--mid-blue" />
      <div className="rx-home-atm-field rx-home-atm-field--mid-green" />
      <div className="rx-home-atm-field rx-home-atm-field--value-green" />
      <div className="rx-home-atm-field rx-home-atm-field--value-blue" />
      <div className="rx-home-atm-field rx-home-atm-field--close-ramp" />
    </div>
  );
}
