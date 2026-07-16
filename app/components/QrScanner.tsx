"use client";

import { useEffect, useRef, useState } from "react";
import { A } from "@/app/components/tokens";

type Status = "idle" | "scanning" | "stopped" | "denied";

export function QrScanner() {
  const containerId = "etu-qr-reader";
  const scannerRef = useRef<unknown>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;
        const Html5Qrcode = mod.Html5Qrcode;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            window.location.href = decoded;
          },
          () => {},
        );
        setStatus("scanning");
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const denied = /permission|notallowed/i.test(message);
        setError(message);
        setStatus(denied ? "denied" : "stopped");
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current as
        | { stop: () => Promise<void>; clear: () => void }
        | null;
      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => {
          try {
            scanner.clear();
          } catch {}
        });
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            marginBottom: 6,
          }}
        >
          Door
        </div>
        <h1
          style={{
            fontFamily: A.fontHead,
            fontSize: 30,
            fontWeight: 500,
            color: A.navy,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Scan check-ins
        </h1>
        <p style={{ marginTop: 10, color: A.muted, fontSize: 14, lineHeight: 1.5 }}>
          Point the camera at an attendee&apos;s QR. The check-in page opens
          automatically when a code is recognised.
        </p>
      </div>

      <div
        id={containerId}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${A.rule}`,
        }}
      />

      <div
        style={{
          marginTop: 16,
          fontSize: 13,
          color: status === "stopped" || status === "denied" ? "#b22234" : A.muted,
          lineHeight: 1.5,
        }}
      >
        Status: <strong style={{ textTransform: "capitalize" }}>{status}</strong>
        {error && (
          <div style={{ marginTop: 6, fontSize: 12 }}>
            {status === "denied"
              ? "Camera access was blocked. Allow permission and reload."
              : error}
          </div>
        )}
      </div>
    </div>
  );
}
