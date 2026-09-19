"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = "bash" }: Props) {
  const t = useTranslations("developers");
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rx-dev-code">
      <div className="rx-dev-code-bar">
        <span>{language}</span>
        <button type="button" onClick={onCopy}>
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
