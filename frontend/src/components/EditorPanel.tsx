import React, { useRef, useEffect, useCallback } from "react";
import MonacoEditor, { type Monaco } from "@monaco-editor/react";
import { FileCode } from "lucide-react";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  isCompiling: boolean;
  activeLine: number;
  sessionId: string | null;
  onClear: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  setCode,
  isCompiling,
  activeLine,
  sessionId,
  onClear
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    highlightLine(activeLine);
  };

  const highlightLine = useCallback((lineNumber: number) => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    // Clear previous line highlights
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    
    if (sessionId) {
      // Add execution line highlights
      decorationsRef.current = editor.deltaDecorations([], [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: "active-execution-line",
            glyphMarginClassName: "bg-yellow-500",
          }
        }
      ]);
      
      // Keep execution centered
      editor.revealLineInCenter(lineNumber);
    }
  }, [sessionId]);

  // Re-run highlights when line cursor shifts
  useEffect(() => {
    highlightLine(activeLine);
  }, [activeLine, highlightLine]);

  return (
    <section className="flex flex-col w-[55%] border-r border-[#2d2d2d] bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-[#2d2d2d]">
        <div className="flex items-center">
          <FileCode className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="text-xs font-bold text-gray-300">main.cpp</span>
        </div>
        <button
          onClick={onClear}
          disabled={isCompiling}
          className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded transition disabled:opacity-50 cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 w-full relative">
        <MonacoEditor
          height="100%"
          language="cpp"
          theme="vs-dark"
          value={code}
          onChange={(val?: string) => setCode(val || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isCompiling,
            fontSize: 14,
            fontFamily: "Fira Code, Consolas, Monaco, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 }
          }}
        />
      </div>
    </section>
  );
};
