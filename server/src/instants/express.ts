import express from "express";
import cors from "cors";
export const app = express();
app.use(cors());
app.get("/test", (req, res) => {
  res.sendFile(
    "C:\\Users\\ADMIN\\Desktop\\LTM\\server\\src\\projects\\jaLqJtpTvxuXxeAAAAAD_project1\\index.html"
  );
});
