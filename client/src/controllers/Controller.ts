import * as monaco from "monaco-editor";
import { ContentWidget } from "../models/ContentWidget.model";
import { IUser } from "../models/User.model";
import { ICursorSelectionChangedEvent } from "../models/CursorSelectionChangedEvent.model";
import { Socket } from "socket.io-client";
import { IFolder } from "../models/Folder.model";
import { IFile } from "../models/File.model";
import { IHistory } from "../models/History.model";
import { toast } from "react-toastify";
import { NavigateFunction, SetURLSearchParams } from "react-router-dom";

let isAdmin$ = false;
let isSocketEvent$ = false; // Avoid conflict between editor change event and socket change event
let _me$: IUser = {};
let users$: { [key: string]: IUser } = {};
let contentWidgets$: { [key: string]: ContentWidget } = {};
let decorations$: {
  [key: string]: monaco.editor.IEditorDecorationsCollection;
} = {};

export interface ISetStateFn {
  setMe: React.Dispatch<React.SetStateAction<IUser | null>>;
  setUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
  setProject: React.Dispatch<React.SetStateAction<IFolder | null>>;
  setOpeningFile: React.Dispatch<React.SetStateAction<IFile | undefined>>;
  setSearchParams: SetURLSearchParams;
}

export class SocketController {
  private socket: Socket;
  private editor: monaco.editor.IStandaloneCodeEditor;

  userEditor: UserEditor;
  setStateFn: ISetStateFn;

  constructor(
    socket: Socket,
    editor: monaco.editor.IStandaloneCodeEditor,
    setStateFn: ISetStateFn
  ) {
    this.socket = socket;
    this.editor = editor;
    this.userEditor = new UserEditor(editor);
    this.setStateFn = setStateFn;
  }

  init() {
    this.initEditorEvents();
    this.initSocketEvents();
  }

  //Event emitters

  emitContentChanged(e: monaco.editor.IModelContentChangedEvent) {
    // Text Change
    if (isSocketEvent$ == false) {
      // this.socket.emit("key", e);
      this.socket.emit("key", e, this.editor.getValue());
    } else {
      isSocketEvent$ = false;
    }
  }

  emitCursorSelectionChanged(e: monaco.editor.ICursorSelectionChangedEvent) {
    const _e: ICursorSelectionChangedEvent = { ...e, user: _me$ };
    //Cursor or Selection Change
    this.socket.emit("selection", _e);
  }

  emitBlurEvent() {
    this.socket.emit("blur", _me$);
  }

  emitFocusEvent() {
    this.socket.emit("focus", _me$);
  }

  emitOpenFile(fileName?: string, lastFileName?: string) {
    this.socket.emit("open-file", fileName, lastFileName);
  }

  emitNewFile(file: IFile) {
    this.socket.emit("new-file", file, users$[_me$.id!]);
  }

  emitSaveFile() {
    this.setStateFn.setOpeningFile((prev) => {
      const file: IFile = { ...prev!, content: this.editor.getValue() };
      this.socket.emit("save-file", users$[_me$.id!], file);
      return prev;
    });
  }

  emitDeleteFile(file: IFile) {
    this.socket.emit("delete-file", file, users$[_me$.id!]);
  }

  emitRevertFile(file: IFile) {
    this.socket.emit("revert-file", users$[_me$.id!], file);
  }

  emitCompile(projectName: string) {
    this.socket.emit("compile", projectName);
  }

  private initEditorEvents() {
    this.editor.onDidChangeModelContent((e) => {
      this.emitContentChanged(e);
    });
    this.editor.onDidChangeCursorSelection((e) => {
      this.emitCursorSelectionChanged(e);
    });
    this.editor.onDidFocusEditorWidget(() => {
      this.emitFocusEvent();
    });
    this.editor.onDidBlurEditorWidget(() => {
      this.emitBlurEvent();
    });
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      this.emitSaveFile();
    });
  }

  //User event listeners

  private onConnect() {
    _me$ = {
      id: this.socket.id,
      name: `Me - ${JSON.parse(localStorage.getItem("user")!)?.name}` ?? "Me",
    };
    this.setStateFn.setMe({ ..._me$ });
  }

  private onAnotherConnected(data: IUser) {
    toast.success(`${data.name} connected.`);
    users$[data.id!] = data;
    this.userEditor.insertCSS(data);
    this.userEditor.insertWidget(data);
    decorations$[data.id!] = this.editor.createDecorationsCollection();
    if (isAdmin$ === true) {
      // this.editor.updateOptions({ readOnly: false });
      // this.socket.emit("filedata", this.editor.getValue());
    }
  }

  private onProject(project: IFolder) {
    this.setStateFn.setProject(project);
  }

  private onUsers(data: IUser[]) {
    this.setStateFn.setUsers(data);
    if (data.length == 1) isAdmin$ = true;
    for (var user of data) {
      users$[user.id!] = user;
      this.userEditor.insertCSS(user);
      this.userEditor.insertWidget(user);
      decorations$[user.id!] = this.editor.createDecorationsCollection();
    }
  }

  private onBlur(data: IUser) {
    this.editor.removeContentWidget(contentWidgets$[data.id!]);
  }

  private onFocus(data: IUser) {
    if (!contentWidgets$[data.id!]) {
      this.editor.addContentWidget(contentWidgets$[data.id!]);
    }
  }

  private onNewFile(data: IFile, user: IUser) {
    this.setStateFn.setProject((prev) => ({
      ...prev,
      files: { ...prev?.files!, [data.name]: data },
    }));
    if (user.id !== _me$.id)
      toast.info(`${user.name} created new file: ${data.name}.`);
  }

  private onRevertFile(file: IFile, user: IUser) {
    this.setStateFn.setOpeningFile((prev) => {
      if (prev?.name === file.name) {
        this.editor.setValue(file.content);
        return file;
      } else return prev;
    });
    toast.warning(`${user.name} has reverted file: ${file.name}!!!`);
  }

  private onDeleteFile(file: IFile, user: IUser) {
    this.setStateFn.setOpeningFile((prev) => {
      if (prev?.name === file.name) {
        this.setStateFn.setSearchParams({});
        return undefined;
      } else return prev;
    });
    toast.error(`${user.name} has deleted file: ${file.name}`);
  }

  private onResetData(data: string) {
    isSocketEvent$ = true;
    try {
      this.editor.setValue(data);
    } catch (e) {
      console.log(e);
    }
    isSocketEvent$ = false;
  }

  private onAdmin(dbProject: IFolder) {
    isAdmin$ = true;
    this.setStateFn.setProject(dbProject);
  }

  private onUpdateHistory(history: IHistory) {
    this.setStateFn.setProject((prev) => {
      const newHistory = [...(prev?.history ?? [])];
      newHistory.push(history);
      return { ...prev, history: newHistory };
    });
    if (history.user.id === _me$.id) {
      toast.success("Save file successfully!");
    } else {
      toast.info(`${history.user.name} has updated file ${history.file.name}`);
    }
  }

  private onCompileOutput(output: any) {
    alert(output);
  }

  //Editor event listeners

  private onKeyPress(e: monaco.editor.IModelContentChangedEvent) {
    // private onKeyPress(content: string) {
    isSocketEvent$ = true;
    this.userEditor.changeText(e);
    // this.editor.setValue(content);
  }

  private onSelection(data: ICursorSelectionChangedEvent) {
    this.userEditor.changeSelection(data);
    this.userEditor.changeWidgetPosition(data);
  }

  /**
   * Removes the content widget, clears the decorations collection, and deletes the corresponding entries from the decorations and IcontentWidgets objects.
   */
  private onExit(data: IUser): void {
    const { id } = data;
    toast.warn(`${users$[id!].name} has left.`);
    this.editor.removeContentWidget(contentWidgets$[id!]);
    // this.editor.createDecorationsCollection([]);
    delete decorations$[id!];
    delete contentWidgets$[id!];
    delete users$[id!];
    document.getElementById(`style-${data.id!}`)?.remove();
    this.setStateFn.setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  private initSocketEvents() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("connected", this.onAnotherConnected.bind(this));
    this.socket.on("project", this.onProject.bind(this));
    this.socket.on("users", this.onUsers.bind(this));
    this.socket.on("resetdata", this.onResetData.bind(this));
    this.socket.on("admin", this.onAdmin.bind(this));
    this.socket.on("selection", this.onSelection.bind(this));
    this.socket.on("exit", this.onExit.bind(this));
    this.socket.on("new-file", this.onNewFile.bind(this));
    this.socket.on("revert-file", this.onRevertFile.bind(this));
    this.socket.on("delete-file", this.onDeleteFile.bind(this));
    this.socket.on("blur", this.onBlur.bind(this));
    this.socket.on("focus", this.onFocus.bind(this));
    this.socket.on("update-history", this.onUpdateHistory.bind(this));
    this.socket.on("compile-output", this.onCompileOutput.bind(this));

    //Vì sự kiện key chỉ chuyển các phím đã ấn xuống đến các user khác nên sẽ bị lỗi khi bấm tiếng Việt
    //Có thể sửa lại bằng cách gửi luôn nội dung của editor, nhưng như vậy sẽ không tối ưu hiệu năng
    this.socket.on("key", this.onKeyPress.bind(this));
  }
}

export class UserEditor {
  editor: monaco.editor.IStandaloneCodeEditor;
  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  insertCSS(user: IUser) {
    let style = document.createElement("style");
    style.id = "style-" + user.id!;
    style.type = "text/css";
    style.innerHTML +=
      "." + user.id + " { background-color:" + user.color + "40" + "}\n"; //Selection Design
    style.innerHTML += `
    .${user.id}one { 
        background: ${user.color};
        width:2px !important
    }`; //cursor Design
    if (!!!document.getElementById(`style-${user.id!}`)) {
      document.getElementsByTagName("body")[0].appendChild(style);
    }
  }

  insertWidget(user: IUser /*, domNode?: HTMLElement*/) {
    contentWidgets$[user.id!] = new ContentWidget(user);
  }

  removeWidget(user: IUser /*, domNode?: HTMLElement*/) {
    contentWidgets$[user.id!] = {} as ContentWidget;
  }

  changeWidgetPosition(e: ICursorSelectionChangedEvent) {
    try {
      contentWidgets$[e.user.id!].position.lineNumber =
        e.selection.endLineNumber;
    } catch (e) {}
    try {
      contentWidgets$[e.user.id!].position.column = e.selection.endColumn;
    } catch (e) {}
    contentWidgets$[e.user.id!];
    this.editor.removeContentWidget(contentWidgets$[e.user.id!]);
    this.editor.addContentWidget(contentWidgets$[e.user.id!]);
  }

  changeText(e: monaco.editor.IModelContentChangedEvent) {
    this.editor.getModel()!.applyEdits(e.changes); //change Content
  }

  changeSelection(e: ICursorSelectionChangedEvent) {
    let selectionArr: monaco.editor.IModelDeltaDecoration[] = [];
    if (decorations$[e.user.id!]) {
      decorations$[e.user.id!].clear();
    }
    let { startColumn, endColumn, startLineNumber, endLineNumber } =
      e.selection;
    if (startColumn === endColumn && startLineNumber == endLineNumber) {
      //if cursor
      endColumn++;
      selectionArr.push({
        range: e.selection,
        options: {
          className: `${e.user.id}one`,
          hoverMessage: {
            value: e.user.id!,
          },
        },
      });
    } else {
      //if selection
      selectionArr.push({
        range: e.selection,
        options: {
          className: e.user.id,
          hoverMessage: {
            value: e.user.id!,
          },
        },
      });
    }
    for (let data of e.secondarySelections) {
      //if select multi
      if (
        data.startColumn == data.endColumn &&
        data.startLineNumber == data.endLineNumber
      ) {
        selectionArr.push({
          range: data,
          options: {
            className: `${e.user}one`,
            hoverMessage: {
              value: e.user.id!,
            },
          },
        });
      } else
        selectionArr.push({
          range: data,
          options: {
            className: e.user.id,
            hoverMessage: {
              value: e.user.id!,
            },
          },
        });
    }

    decorations$[e.user.id!] =
      this.editor.createDecorationsCollection(selectionArr); //apply change
  }
}
