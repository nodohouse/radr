"use client";

import Link from "next/link";
import { berlinWeatherForDate } from "@/lib/radr/weather/berlinWeekWeather";
import { BERLIN_DEMO_TONIGHT } from "@/lib/radr/berlinWeekRoster";
import { WEATHER_TERRACE_FINDING_ID } from "@/lib/radr/findings/rules/detectWeatherSensitiveDemand";

type Props = {
  compact?: boolean;
  /** Service day — drives rain / terrace math */
  dateIso?: string;
};

/**
 * Weather / terrace cue for the selected service day.
 * Rain days close terrace and flip contribution math.
 */
export function WeatherOperatingStrip({
  compact = false,
  dateIso = BERLIN_DEMO_TONIGHT,
}: Props) {
  const ops = berlinWeatherForDate(dateIso);
  const wx = ops.forecast;
  const closed = ops.terrace === "CLOSED";
  const limited = ops.terrace === "LIMITED";

  const mathLine = closed
    ? `Terrace closed · ${ops.terraceCoversVsTypical} covers · €${Math.abs(ops.contributionEuro)} left outdoors`
    : limited
      ? `Terrace limited · ${ops.terraceExpectedCovers} covers · €${ops.contributionEuro} vs typical`
      : ops.terraceCoversVsTypical > 0
        ? `Terrace +${ops.terraceCoversVsTypical} covers · €${ops.contributionEuro} contribution`
        : `Terrace ${ops.terraceExpectedCovers} covers · on typical`;

  if (compact) {
    return (
      <p
        className="rp-wx-line"
        data-terrace={ops.terrace.toLowerCase()}
        aria-label="Weather cue"
      >
        <strong>
          {wx.highC}°C · {wx.summary}
        </strong>
        <span>{mathLine}</span>
        <Link href={`/app/findings/${WEATHER_TERRACE_FINDING_ID}`}>
          {closed || limited ? "Plan" : "Review"}
        </Link>
      </p>
    );
  }

  return (
    <section
      className="rp-wx-brief"
      data-terrace={ops.terrace.toLowerCase()}
      aria-label="Operating brief"
    >
      <header className="rp-wx-brief-head">
        <p className="rp-wx-brief-kicker">Berlin Mitte · weather</p>
        <p className="rp-wx-brief-cond">
          <strong>{wx.highC}°C</strong>
          <span> {wx.summary}</span>
        </p>
      </header>
      <dl className="rp-wx-brief-grid">
        <div>
          <dt>Terrace</dt>
          <dd>{ops.terrace}</dd>
        </div>
        <div>
          <dt>Expected covers</dt>
          <dd>{ops.terraceExpectedCovers}</dd>
        </div>
        <div>
          <dt>Vs typical</dt>
          <dd>
            {ops.terraceCoversVsTypical > 0 ? "+" : ""}
            {ops.terraceCoversVsTypical}
          </dd>
        </div>
        <div>
          <dt>Contribution</dt>
          <dd className="rp-wx-brief-money">
            €{Math.abs(ops.contributionEuro)}
            {closed ? " at risk" : ""}
          </dd>
        </div>
      </dl>
      <p className="rp-wx-brief-note">
        {ops.opsCue} · {ops.reason}
      </p>
    </section>
  );
}
