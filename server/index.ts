import { serverENV } from "./environment";
import { httpServer } from "./src/instants/httpServer";
import { io } from "./src/instants/io";
import { AppSocket } from "./src/app/socket";
import { Namespace, Socket } from "socket.io";
import { app } from "./src/instants/express";

const projects = {} as { [key: string]: Namespace };
app.get("/:projectName", function (req, res) {
  const projectName = req.params.projectName;
  console.log(projectName);

  //Nếu chưa tồn tại namespace
  if (!projects[projectName]) {
    console.log("Create new namespace: " + projectName);

    const nsp = io.of(`/${projectName}`);
    nsp.on("connection", (socket) => {
      AppSocket(socket, nsp, projectName);
    });

    projects[projectName] = nsp;
  } else {
    console.log("Join namespace: " + projectName);
  }
  res.send({ status: "success" });
});

// const nsp = io.of("/main");
// nsp.on("connection", (socket: Socket) => {
//   //writeLog(socket);
//   AppSocket(socket, nsp);
// });

httpServer.listen(serverENV.port, () => {
  console.log("listening on port " + serverENV.port);
});
