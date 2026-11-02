"use client";
import type {FirstValueStep} from "@/lib/onboarding/firstValue";

const STEPS = ["Your role","Organization","First location","Your focus","Evidence","First decision"];
export function setupIndex(step: FirstValueStep) {
  if (step === "welcome") return -1;
  return ({who:0,organization:1,location:2,goal:3,evidence:4,upload:4,mapping:4,data_health:5,analyzing:5,reveal:5,complete:5,legacy:0} as const)[step];
}
export function SetupJourney({step,orgName,locationName,currency,preview}: {step: FirstValueStep;orgName:string;locationName:string;currency:string;preview:boolean}) {
  const index = setupIndex(step);
  return <aside className="ob-journey" aria-label="Workspace setup overview"><span className="ob-entry-eyebrow">YOUR FIRST DECISION</span><h2>Start small.<br/>Make it matter.</h2><p>One location. One priority. Evidence you can inspect before making a call.</p><ol aria-label="Setup steps">{STEPS.map((label,i)=><li key={label} aria-current={i===index?"step":undefined} data-state={i<index?"complete":i===index?"current":"next"}><span aria-hidden="true">{i<index?"✓":String(i+1).padStart(2,"0")}</span><div><strong>{label}</strong>{i===index?<small>In progress</small>:i<index?<small>Completed</small>:null}</div></li>)}</ol><div className="ob-journey-scope"><small>{preview?"PREVIEW WORKSPACE":"YOUR SETUP"}</small><strong>{orgName||"Your organization"}</strong><span>{locationName||"One location to start"} · {currency}</span></div><p className="ob-journey-trust">Evidence first. Human judgment stays in your hands. No system changes are executed during setup.</p></aside>;
}
