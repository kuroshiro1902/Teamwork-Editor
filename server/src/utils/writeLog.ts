import { Socket } from "socket.io";
import fs from "fs";
import { formatDate } from "./formatDate";
export function writeLog(socket: Socket, data?: string) {
  fs.writeFile(
    "src/logs/connection.txt",
    data
      ? `${data}\n`
      : `${socket.id} connected at ${formatDate(new Date())}.\n`,
    { flag: "a" },
    (err) => {}
  );
}
