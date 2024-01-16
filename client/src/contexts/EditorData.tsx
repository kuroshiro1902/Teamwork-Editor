import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import * as monaco from "monaco-editor";
import { serverENV } from "../environment";
import { ISetStateFn, SocketController } from "../controllers/Controller";
import { IFolder } from "../models/Folder.model";
import { IFile } from "../models/File.model";
import { IUser } from "../models/User.model";
import { useSearchParams } from "react-router-dom";
import { EFileType } from "../constants/FileType.constant";

interface EditorData {
  project: IFolder | null;
  openingFile?: IFile;
  me: IUser | null;
  users: IUser[];
  setOpeningFile: React.Dispatch<React.SetStateAction<IFile | undefined>>;
  setProject: React.Dispatch<React.SetStateAction<IFolder | null>>;
  socketController?: SocketController;
}

const defaultEditorValue = "```\nWelcome to LiveCodeEditor :)\n```";
let lastFile = "";

export const EditorDataContext = createContext({} as EditorData);
export function EditorDataProvider({ children }: any) {
  const [params, setSearchParams] = useSearchParams();
  const file = params.get("file");

  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const [socketController, setSocketController] = useState<SocketController>();

  const [project, setProject] = useState<IFolder | null>(null);
  const [openingFile, setOpeningFile] = useState<IFile>();
  const [me, setMe] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  useEffect(() => {
    const editorLang =
      EFileType[file?.split(".").pop() ?? "js"]?.lang ?? "javascript";
    const model = editor?.getModel();
    model && monaco.editor.setModelLanguage(model, editorLang);
    if (file) {
      editor?.updateOptions({ readOnly: false });
      socketController?.emitOpenFile(file, lastFile);
      setOpeningFile(project?.files?.[file]);
      lastFile = file;
    } else {
      editor?.updateOptions({ readOnly: true });
      socketController?.emitOpenFile(undefined, lastFile);
      setOpeningFile(undefined);
    }
  });
  useEffect(() => {
    const { editor, socket, socketController } = setUp({
      setMe,
      setUsers,
      setProject,
      setOpeningFile,
      setSearchParams,
    });
    setEditor(editor);
    setSocketController(socketController);
    return () => {
      // Hủy phiên khi component bị hủy
      localStorage.removeItem("user");
      editor.dispose();
      socket.disconnect();
    };
  }, []);
  return (
    <EditorDataContext.Provider
      value={{
        project,
        openingFile,
        users,
        me,
        setOpeningFile,
        setProject,
        socketController,
      }}
    >
      {children}
    </EditorDataContext.Provider>
  );
}

//
function createEditor() {
  return monaco.editor.create(document.getElementById("Editor")!, {
    value: defaultEditorValue,
    language: "javascript",
    theme: "vs-dark", //'vs' (default), 'vs-dark', 'hc-black', 'hc-light'
    readOnly: true,
  });
}

function setUp(setStateFn: ISetStateFn) {
  const user = JSON.parse(localStorage.getItem("user")!);
  const userName = user.name;
  const projectName = user.projectName;
  const editor = createEditor();
  const socket = io(
    serverENV.url +
      `/${user.projectName ?? window.location.pathname.split("/")[1]}`,
    {
      withCredentials: true,
      query: {
        userName,
      },
    }
  );
  const socketController = new SocketController(socket, editor, setStateFn);
  socketController.init();
  return { editor, socket, socketController };
}
