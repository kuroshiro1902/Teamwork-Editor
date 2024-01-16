import { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";

function Editor() {
  const editorRef = useRef(null);

  useEffect(() => {
    //@ts-ignore
    const editor = monaco.editor.create(editorRef.current, {
      value: 'console.log("Hello, world!");',
      language: "javascript",
      theme: "vs-dark", //'vs' (default), 'vs-dark', 'hc-black', 'hc-light'
    });

    return () => {
      // Hủy phiên khi component bị hủy
      editor.dispose();
    };
  }, []);

  return (
    <div id='Editor'>
      <div ref={editorRef} style={{ height: "600px" }} />;
    </div>
  );
}

export default Editor;
