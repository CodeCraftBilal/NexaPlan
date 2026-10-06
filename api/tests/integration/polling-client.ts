import assert from "node:assert/strict";
import { z } from "zod";

/** Exercise Socket.IO's polling transport without a second client dependency. */
export async function pollingClient(base: string, cookie?: string) {
  const endpoint = `${base}/socket.io/?EIO=4&transport=polling`;
  const headers = cookie ? { cookie } : undefined;
  const opening = await fetch(endpoint, {
    ...(headers ? { headers } : {}),
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(opening.status, 200);
  const packet = await opening.text();
  assert.ok(packet.startsWith("0"));
  const { sid } = z
    .object({ sid: z.string() })
    .parse(JSON.parse(packet.slice(1)));
  const url = `${endpoint}&sid=${encodeURIComponent(sid)}`;

  return {
    async send(packet: string) {
      const response = await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "text/plain;charset=UTF-8" },
        body: packet,
        signal: AbortSignal.timeout(5_000),
      });
      assert.equal(response.status, 200);
      await response.text();
    },
    async read() {
      const response = await fetch(url, {
        ...(headers ? { headers } : {}),
        signal: AbortSignal.timeout(5_000),
      });
      assert.equal(response.status, 200);
      return response.text();
    },
  };
}
