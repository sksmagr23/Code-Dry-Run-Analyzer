import React, { useRef, useEffect, useCallback } from "react";
import MonacoEditor, { type Monaco } from "@monaco-editor/react";
import { FileCode } from "lucide-react";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  isCompiling: boolean;
  activeLine: number;
  sessionId: string | null;
  onClear?: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  setCode,
  isCompiling,
  activeLine,
  sessionId,
  onClear: _onClear
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
    
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    
    if (sessionId) {
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
      
      editor.revealLineInCenter(lineNumber);
    }
  }, [sessionId]);

  useEffect(() => {
    highlightLine(activeLine);
  }, [activeLine, highlightLine]);

  return (
    <section className="flex flex-col w-full h-full bg-[#121214]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#131316] border-b border-[#27272a]">
        <div className="flex items-center">
          <FileCode className="w-3.5 h-3.5 mr-2 text-emerald-400" />
          <span className="text-xs font-bold font-mono text-gray-300">Solution.cpp</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">C++20</span>
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
