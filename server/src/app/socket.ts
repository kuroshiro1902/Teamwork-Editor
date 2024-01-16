import { Namespace, Socket } from "socket.io";
import { IUser } from "../models/User.model";
import { IFile } from "../models/File.model";
import { IFolder } from "../models/Folder.model";

import { writeLog } from "../utils/writeLog";
import { IHistory } from "../models/History.model";
import { compile } from "./compile";

let users: { [projectName: string]: { [key: string]: IUser } } = {}; //fake db for saving users
let dbProject: { [key: string]: IFolder } = {};
let project = { ...dbProject };

//when new user connect
export function AppSocket(
  socket: Socket,
  server: Namespace,
  projectName: string
) {
  const userSocket = new UserSocket(socket, server, projectName);
  if (!dbProject[projectName]) createProject(projectName);

  //Create user
  if (!!!users[projectName][socket.id])
    users[projectName][socket.id] = createConnectedUser(socket);

  // set Admin
  if (server.sockets.size == 1) {
    //if First Connect Client
    users[projectName][socket.id].isAdmin = true;
    userSocket.emitAdmin();
  }
  // else {}

  userSocket.emitProject();

  userSocket.emitUsers();

  userSocket.emitNewUserConnected();

  userSocket.initEventListeners();
}

class UserSocket {
  private socket: Socket;
  private server: Namespace;
  private currentFileName: string;
  private projectName: string;
  constructor(socket: Socket, server: Namespace, projectName: string) {
    this.socket = socket;
    this.server = server;
    this.projectName = projectName;
    this.currentFileName = "";
  }

  /**
   * Emit user information
   */

  /**
   * Notify to all user that a new user connected.
   */
  emitNewUserConnected() {
    this.socket.broadcast.emit(
      "connected",
      users[this.projectName][this.socket.id]
    );
  }

  /**
   * Send a signal to user: "You are admin".
   */
  emitAdmin() {
    this.socket
      .to(this.currentFileName)
      .emit("admin", dbProject[this.projectName]);
  }

  /**
   * Send all users' datas to every user
   */
  emitUsers() {
    this.server.emit("users", Object.values(users[this.projectName]));
  }

  emitProject() {
    const firstUserConnected =
      Object.values(users[this.projectName]).length <= 0;
    this.server.emit(
      "project",
      firstUserConnected
        ? dbProject[this.projectName]
        : project[this.projectName]
    );
  }

  emitUpdateHistory(history: IHistory) {
    this.server.emit("update-history", history);
  }

  emitRevertFile(file: IFile, user: IUser) {
    this.server.emit("revert-file", file, user);
  }

  emitDeleteFile(file: IFile, user: IUser) {
    this.server.emit("delete-file", file, user);
  }

  initEventListeners() {
    const socket = this.socket;
    socket.on("key", (e: any, content: any) => {
      socket.broadcast.to(this.currentFileName).emit("key", e);
      try {
        project[this.projectName].files![this.currentFileName].content =
          content;
      } catch (e) {}
    });
    socket.on("selection", (data: any) => {
      socket.broadcast.to(this.currentFileName).emit("selection", data);
    });
    socket.on("disconnect", () => {
      socket.broadcast.emit("exit", users[this.projectName][socket.id]);
      delete users[this.projectName][socket.id];
    });
    socket.on("new-file", (newFile: IFile, user: IUser) => {
      project[this.projectName] = {
        ...project[this.projectName],
        files: { ...project[this.projectName].files!, [newFile.name]: newFile },
      };
      socket.broadcast.emit("new-file", newFile, user);
    });
    socket.on("open-file", (fileName: string, lastFileName: string) => {
      socket.leave(lastFileName);
      if (!!fileName) {
        this.currentFileName = fileName;
        socket.join(fileName);
        socket.emit(
          "resetdata",
          project[this.projectName].files?.[fileName]?.content
        );
      }
    });
    socket.on("save-file", (user: IUser, file: IFile) => {
      if (!!this.currentFileName && !!file.name) {
        const history = {
          file,
          time: new Date(),
          user,
        } as IHistory;
        dbProject[this.projectName].history?.push(history);
        this.emitUpdateHistory(history);
      }
    });
    socket.on("delete-file", (file: IFile, user: IUser) => {
      delete dbProject[this.projectName].files?.[file.name!];
      delete project[this.projectName].files?.[file.name!];
      this.emitProject();
      this.emitDeleteFile(file, user);
    });
    socket.on("revert-file", (user: IUser, file: IFile) => {
      const history = {
        file,
        time: new Date(),
        user,
      } as IHistory;
      dbProject[this.projectName].files![file.name!] = file;
      project[this.projectName].files![file.name!] = file;
      dbProject[this.projectName].history?.push(history);
      project[this.projectName].history?.push(history);
      // this.emitUpdateHistory(history);
      this.emitProject();
      this.emitRevertFile(history.file, user);
    });
    socket.on("blur", (user: IUser) => {
      socket.broadcast.to(this.currentFileName).emit("blur", user);
    });
    socket.on("focus", (user: IUser) => {
      socket.broadcast.to(this.currentFileName).emit("focus", user);
    });
    socket.on("compile", async (projectName: string) => {
      const output = await compile(project[projectName]);
      let res: any;
      if (output === null) res = null;
      else res = output.stdout;
      this.server.to(socket.id).emit("compile-output", res);
    });
  }
}

function createProject(projectName: string) {
  dbProject[projectName] = {
    name: projectName,
    id: projectName,
    folders: [],
    files: {},
    history: [],
  };
  project[projectName] = { ...dbProject[projectName] };
  users[projectName] = {};
}
/**
 * Create a new connected user.
 */
function createConnectedUser(socket: Socket): IUser {
  return {
    id: socket.id,
    //@ts-ignore
    name: socket.handshake.query.userName,
    isAdmin: false,
    color: getRandomColor(),
  } as IUser;
}

function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
