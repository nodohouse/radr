/** Bound streamed JSON before buffering it, including requests without Content-Length. */
export class RequestBodyError extends Error {
  constructor(public readonly status: 400 | 413) {
    super(status === 413 ? "Request too large." : "Invalid JSON request.");
  }
}
export async function readJsonWithinLimit(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new RequestBodyError(413);
  if (!request.body) throw new RequestBodyError(400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0,
    text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400);
  } finally {
    reader.releaseLock();
  }
}
