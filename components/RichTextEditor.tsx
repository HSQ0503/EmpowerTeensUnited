"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState, type CSSProperties } from "react";
import { A } from "@/app/components/tokens";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

export function RichTextEditor({ name, defaultValue = "" }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) return null;

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
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          style={btn(false)}
          aria-label="Image"
        >
          Image
        </button>
      </div>
      <div style={{ padding: 16, minHeight: 240, fontFamily: A.fontBody, color: A.ink, lineHeight: 1.6 }}>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
