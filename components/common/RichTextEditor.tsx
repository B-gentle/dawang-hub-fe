"use client";

import { useEffect, useRef } from "react";
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuList,
  LuListOrdered,
  LuHeading2,
  LuHeading3,
  LuLink,
  LuRemoveFormatting,
  LuUndo2,
  LuRedo2,
} from "react-icons/lu";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleAddLink = () => {
    const url = window.prompt("Enter URL (https://...):", "https://");
    if (url && url.trim()) {
      exec("createLink", url.trim());
    }
  };

  return (
    <div className="border border-[#EAE8E4] rounded-md overflow-hidden bg-white focus-within:border-[#C4956A] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF9F6] border-b border-[#EAE8E4]">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "H2");
          }}
          title="Section Heading (H2)"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuHeading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "H3");
          }}
          title="Subheading (H3)"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuHeading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#EAE8E4] mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          title="Bold"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuBold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          title="Italic"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuItalic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("underline");
          }}
          title="Underline"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuUnderline className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#EAE8E4] mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertOrderedList");
          }}
          title="Numbered List"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertUnorderedList");
          }}
          title="Bulleted List"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuList className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#EAE8E4] mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleAddLink();
          }}
          title="Insert Link"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuLink className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("removeFormat");
          }}
          title="Clear Formatting"
          className="p-1.5 rounded hover:bg-white text-[#151413] border border-transparent hover:border-[#EAE8E4] cursor-pointer"
        >
          <LuRemoveFormatting className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("undo");
            }}
            title="Undo"
            className="p-1.5 rounded hover:bg-white text-[#76726E] hover:text-[#151413] cursor-pointer"
          >
            <LuUndo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("redo");
            }}
            title="Redo"
            className="p-1.5 rounded hover:bg-white text-[#76726E] hover:text-[#151413] cursor-pointer"
          >
            <LuRedo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editable Surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        className="min-h-65 max-h-125 overflow-y-auto p-4 text-xs leading-relaxed text-[#151413] focus:outline-hidden [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-heading [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1 [&_a]:text-[#C4956A] [&_a]:underline"
      />
    </div>
  );
}
