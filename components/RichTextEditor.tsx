"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { upload } from "@vercel/blob/client";
import { useRef, useState, type CSSProperties } from "react";
import { A } from "@/app/components/tokens";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({ name, defaultValue = "", minHeight = 240 }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) return null;

  async function onPickImage(file: File) {
    setUploading(true);
    try {
      const result = await upload(`blog-body/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      editor?.chain().focus().setImage({ src: result.url }).run();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const btn = (active: boolean): CSSProperties => ({
    background: active ? A.navy : "#fff",
    color: active ? "#fff" : A.navy,
    border: `1px solid ${A.rule}`,
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: A.fontBody,
    fontWeight: 600,
    minWidth: 32,
  });

  return (
    <div
      style={{
        border: `1px solid ${A.rule}`,
        borderRadius: 4,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 8,
          borderBottom: `1px solid ${A.rule}`,
          flexWrap: "wrap",
          background: A.ruleSoft,
        }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={btn(editor.isActive("bold"))}
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={btn(editor.isActive("italic"))}
          aria-label="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={btn(editor.isActive("heading", { level: 2 }))}
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={btn(editor.isActive("heading", { level: 3 }))}
          aria-label="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={btn(editor.isActive("bulletList"))}
          aria-label="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={btn(editor.isActive("orderedList"))}
          aria-label="Ordered list"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={btn(editor.isActive("blockquote"))}
          aria-label="Quote"
        >
          &ldquo; &rdquo;
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else if (url === "") editor.chain().focus().unsetLink().run();
          }}
          style={btn(editor.isActive("link"))}
          aria-label="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...btn(false), opacity: uploading ? 0.6 : 1 }}
          aria-label="Upload image"
        >
          {uploading ? "Uploading…" : "Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onPickImage(file);
          }}
          style={{ display: "none" }}
        />
      </div>
      <div style={{ padding: 16, minHeight, fontFamily: A.fontBody, color: A.ink, lineHeight: 1.6 }}>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
