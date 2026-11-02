"use client";

import { createAuthClient } from "better-auth/react";

// The UI and auth API share an origin, including isolated Vercel previews.
export const authClient = createAuthClient();
