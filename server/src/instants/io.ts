import fs from "fs";
import { Server, Socket } from "socket.io";
import { clientENV, serverENV } from "../../environment";
import { httpServer } from "./httpServer";

export const io = new Server(httpServer, {
  cors: {
    origin: [...clientENV.url],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
