"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { validEmail, validNewPassword } from "@/lib/onboarding/requiredFields";
export function useAuthFormValidity(
  kind: "login" | "signup" | "forgot" | "reset",
) {
  const ref = useRef<HTMLFormElement>(null);
  const [valid, setValid] = useState(false);
  const update = useCallback(() => {
    const form = ref.current;
    if (!form) return;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    setValid(
      kind === "reset"
        ? validNewPassword(password) && password === confirm
        : validEmail(email) &&
            (kind === "forgot" ||
              (kind === "signup"
                ? validNewPassword(password)
                : password.length > 0 && password.length <= 128)),
    );
  }, [kind]);
  useEffect(() => {
    const form = ref.current;
    const check = () => update();
    form?.addEventListener("input", check);
    form?.addEventListener("change", check);
    check();
    return () => {
      form?.removeEventListener("input", check);
      form?.removeEventListener("change", check);
    };
  }, [update]); // Inputs are read from the form, including password-manager changes.
  return { ref, valid, update };
}
