import { describe, expect, it } from "vitest";
import { readJsonWithinLimit } from "@/lib/security/request-body";
const streamed = (chunks: string[], headers: Record<string, string> = {}) =>
  new Request("http://localhost", {
    method: "POST",
    headers,
    body: new ReadableStream({
      start(controller) {
        for (const text of chunks)
          controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);
describe("bounded JSON input", () => {
  it("accepts valid chunked input", async () => {
    expect(
      await readJsonWithinLimit(streamed(['{"a":', '"value"}']), 100),
    ).toEqual({ a: "value" });
  });
  it("rejects an oversized stream without a content-length header", async () => {
    await expect(
      readJsonWithinLimit(streamed(['{"a":"', "x".repeat(100), '"}']), 50),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("does not trust a forged smaller content length", async () => {
    await expect(
      readJsonWithinLimit(
        streamed(['"' + "x".repeat(100) + '"'], { "content-length": "2" }),
        50,
      ),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("counts UTF-8 bytes instead of characters", async () => {
    await expect(
      readJsonWithinLimit(streamed(['"' + "€".repeat(20) + '"']), 50),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("rejects malformed JSON and missing bodies", async () => {
    await expect(
      readJsonWithinLimit(streamed(["{"]), 50),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      readJsonWithinLimit(new Request("http://localhost"), 50),
    ).rejects.toMatchObject({ status: 400 });
  });
});
