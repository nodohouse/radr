import { safeInternalPath } from "@/lib/security/safe-redirect";

/** Explicit user journeys take priority over the workspace's default landing. */
export function postLoginDestination(
  requested: string | null | undefined,
  workspace: string | null | undefined,
) {
  return safeInternalPath(requested, "") || safeInternalPath(workspace, "/onboarding");
}
