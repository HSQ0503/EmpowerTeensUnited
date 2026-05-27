import { describe, it, expect, beforeEach } from "vitest";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";

describe("buildScanUrl", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("encodes the token into the scan URL using NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(buildScanUrl("abc-123")).toBe("https://example.com/api/scan?t=abc-123");
  });

  it("falls back to localhost when NEXT_PUBLIC_SITE_URL is unset", () => {
    expect(buildScanUrl("xyz")).toBe("http://localhost:3000/api/scan?t=xyz");
  });
});

describe("generateQrDataUrl", () => {
  it("produces a PNG data URL for an arbitrary payload", async () => {
    const dataUrl = await generateQrDataUrl("hello world");
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
