"use client";

/**
 * DeviceScene — max 3 synchronized surfaces.
 * Desktop Control Center · phone approval · FOH Floor card.
 * Not a mockup collage.
 */

export function DeviceScene({
  desktop,
  phone,
  floor,
}: {
  desktop: { title: string; body: string; meta?: string };
  phone: { title: string; body: string; meta?: string };
  floor: { title: string; body: string; meta?: string; note?: string };
}) {
  return (
    <div className="rx-device-scene" aria-label="RADR across roles">
      <div className="rx-device-desk">
        <header>
          <em>Control Center</em>
          <span>GM</span>
        </header>
        <strong>{desktop.title}</strong>
        <p>{desktop.body}</p>
        {desktop.meta ? <span className="rx-device-meta">{desktop.meta}</span> : null}
      </div>

      <div className="rx-device-phone">
        <header>
          <em>Brief</em>
          <span>CFO</span>
        </header>
        <strong>{phone.title}</strong>
        <p>{phone.body}</p>
        {phone.meta ? <span className="rx-device-meta">{phone.meta}</span> : null}
      </div>

      <div className="rx-device-floor">
        <header>
          <em>RADR Floor</em>
          <span>FOH</span>
        </header>
        <strong>{floor.title}</strong>
        <p>{floor.body}</p>
        {floor.meta ? <span className="rx-device-meta">{floor.meta}</span> : null}
        {floor.note ? <p className="rx-device-note">{floor.note}</p> : null}
      </div>
    </div>
  );
}
