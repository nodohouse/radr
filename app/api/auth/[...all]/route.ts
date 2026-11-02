import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import {accountStorageReady} from "@/lib/identity/accountAvailability";

const handlers = toNextJsHandler(auth);
const unavailable = () => Response.json({code:"AUTH_NOT_CONFIGURED",message:"Account access is not enabled on this deployment yet. Explore the demo or setup preview."},{status:503,headers:{"Cache-Control":"no-store"}});
export async function GET(request: Request) {return accountStorageReady() ? handlers.GET(request) : unavailable();}
export async function POST(request: Request) {return accountStorageReady() ? handlers.POST(request) : unavailable();}
