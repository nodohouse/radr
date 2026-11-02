import {NextResponse} from "next/server";
import {getAuthIdentity} from "@/lib/identity/provider";
import {AuthzError, requireUploadAuthorization} from "@/lib/authz";
import {getWorkspaceForUser} from "@/lib/onboarding";
import {validateOnboardingCsv, MAX_ONBOARDING_CSV_BYTES} from "@/lib/onboarding/csvUpload";
import {db} from "@/lib/db";
import {documents} from "@/lib/db/schema";
import {newId} from "@/lib/ids";
import {putPrivateObject} from "@/lib/storage";
import {writeAuditLog} from "@/lib/audit";
import {clientKeyFromRequest, rateLimit} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = rateLimit({key:clientKeyFromRequest(request,"onboarding-csv"),limit:20,windowMs:60_000});
  if (!limit.ok) return NextResponse.json({error:"Please wait before uploading again."},{status:429});
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({error:"Sign in to upload evidence."},{status:401});
  const workspace = await getWorkspaceForUser(identity.userId);
  if (!workspace) return NextResponse.json({error:"Create your workspace first."},{status:404});
  if (process.env.VERCEL && process.env.STORAGE_DRIVER !== "s3") return NextResponse.json({error:"Private evidence storage is not configured on this deployment yet."},{status:503});
  try { await requireUploadAuthorization(identity.userId,workspace.organizationId); }
  catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({error:"You do not have permission to upload evidence."},{status:error.status});
    throw error;
  }
  if (Number(request.headers.get("content-length")) > MAX_ONBOARDING_CSV_BYTES + 65536) return NextResponse.json({error:"CSV files must be 1 MB or smaller."},{status:413});
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({error:"Choose a CSV file."},{status:400}); }
  const file = form.get("file"), kind = form.get("documentType");
  if (!(file instanceof File) || (kind !== "CONTRACT" && kind !== "INVOICE")) return NextResponse.json({error:"Choose contract or invoice CSV evidence."},{status:400});
  if (file.size > MAX_ONBOARDING_CSV_BYTES) return NextResponse.json({error:"CSV files must be 1 MB or smaller."},{status:413});
  const bytes = Buffer.from(await file.arrayBuffer());
  let valid;
  try { valid = validateOnboardingCsv(bytes,file.name,kind); }
  catch (error) { return NextResponse.json({error:error instanceof Error ? error.message : "Invalid CSV."},{status:400}); }
  const id = newId(), now = new Date();
  const stored = await putPrivateObject({organizationId:workspace.organizationId,documentId:id,originalFilename:valid.filename,mimeType:valid.mimeType,body:bytes});
  await db.insert(documents).values({id,organizationId:workspace.organizationId,locationId:workspace.primaryLocation?.id ?? null,supplierId:null,uploadedBy:identity.userId,documentType:kind,originalFilename:valid.filename,storagePath:stored.storagePath,mimeType:valid.mimeType,fileSize:bytes.length,status:"UPLOADED",createdAt:now,updatedAt:now});
  await writeAuditLog({organizationId:workspace.organizationId,actorUserId:identity.userId,action:"DOCUMENT_UPLOADED",resourceType:"document",resourceId:id,metadata:{documentType:kind,rows:valid.rows,source:"onboarding_csv"}});
  return NextResponse.json({documents:[{id,rows:valid.rows,originalFilename:valid.filename}]});
}
