import { Server } from "http";
import { app } from "./express";

export const httpServer = new Server(app);
