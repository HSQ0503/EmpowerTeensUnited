"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, type ChangeEvent, type DragEvent, type CSSProperties } from "react";
import { A } from "@/app/components/tokens";

type Props = {
  name: string;
  defaultValue?: string | null;
  pathPrefix?: string;
};

export function ImageUploadField({ name, defaultValue, pathPrefix = "uploads" }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const result = await upload(`${pathPrefix}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setUrl(result.url);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onClick() {
    inputRef.current?.click();
  }

  function clear() {
    setUrl("");
    setError(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropZone: CSSProperties = {
    border: `1.5px dashed ${A.rule}`,
    borderRadius: 6,
    padding: 20,
    textAlign: "center",
    cursor: "pointer",
    background: A.ruleSoft,
    color: A.body,
    fontSize: 13,
    transition: "border-color 120ms, background 120ms",
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onChange}
        style={{ display: "none" }}
      />
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            padding: 12,
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            background: "#fff",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Uploaded preview"
            style={{
              width: 120,
              height: 80,
              objectFit: "cover",
              borderRadius: 4,
              border: `1px solid ${A.rule}`,
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: A.muted,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={url}
            >
              {url}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onClick}
                style={{
                  background: "#fff",
                  color: A.navy,
                  border: `1px solid ${A.rule}`,
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: A.fontBody,
                  fontWeight: 600,
                }}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clear}
                style={{
                  background: "#fff",
                  color: "#b53636",
                  border: `1px solid ${A.rule}`,
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: A.fontBody,
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={onClick}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          style={dropZone}
        >
          {status === "uploading" ? (
            <span>Uploading…</span>
          ) : (
            <>
              <div style={{ fontWeight: 600, color: A.navy, marginBottom: 4 }}>
                Click or drop an image
              </div>
              <div style={{ fontSize: 12, color: A.muted }}>JPG, PNG, WEBP, GIF · up to 5 MB</div>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#b53636" }}>{error}</div>
      )}
    </div>
  );
}
