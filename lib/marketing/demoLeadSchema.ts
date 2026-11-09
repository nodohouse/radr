import { z } from "zod";

export const demoLeadSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().min(2).max(200),
    role: z.enum([
      "owner",
      "finance",
      "operations",
      "general-manager",
      "other",
    ]),
    locations: z.enum(["1", "2-5", "6-20", "21-50", "50+"]),
    vertical: z.enum(["restaurant", "hotel"]),
    website: z.string().max(200).default(""),
  })
  .strict();

export type DemoLead = z.infer<typeof demoLeadSchema>;
