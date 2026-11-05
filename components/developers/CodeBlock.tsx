"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Props = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = "bash" }: Props) {
  const t = useTranslations("developers");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onCopy() {
    try {
      setFailed(false);
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setFailed(true);
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
      {failed && (
        <p role="status" className="rx-dev-copy-status">
          Clipboard is unavailable. Select and copy the code below.
        </p>
      )}
      <pre tabIndex={0} aria-label={`${language} code example`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
