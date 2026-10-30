"use client";

/**
 * ControlCenterCommandStage — light CC introduction only.
 * Operating state lives in GlobalOperatingHeader (do not duplicate).
 */

import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  DEMO_PERSONAS,
  personaFromRoleView,
} from "@/lib/radr/product/personas";

type Props = {
  /** @deprecated Operating strip owns judgment — ignored. */
  needJudgment?: number;
  compressionLine?: string;
  compressionParts?: unknown;
  signals?: unknown[];
  judgments?: unknown[];
  greeting?: string;
  onNeedJudgment?: () => void;
};

export function ControlCenterCommandStage({ greeting }: Props) {
  const { roleView } = useProduct();
  const { session } = useDemoOrg();
  const persona = DEMO_PERSONAS[personaFromRoleView(roleView, session.vertical)];
  const personaName =
    persona.firstName ||
    persona.shortLabel.split("·")[0]?.trim() ||
    persona.shortLabel;

  const hour = new Date().getHours();
  const greet =
    greeting ??
    (hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening");

  return (
    <header
      className="rp-cmd-stage rp-cmd-stage-intro"
      data-stage="intro"
      data-layout="compose"
      aria-label="Command introduction"
    >
      <p className="rp-cmd-stage-greet">
        {greet}, {personaName}
      </p>
    </header>
  );
}

export type CommandStageSignal = {
  id: string;
  text: string;
  href?: string;
  onClick?: () => void;
};

export type CommandStageJudgment = {
  id: string;
  displayId: string;
  title: string;
  economic: string;
  onClick?: () => void;
  href?: string;
};

export type CommandCompressionParts = {
  evaluated: number;
  cleared: number;
  handling: number;
  watching: number;
};
