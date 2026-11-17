import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config/index.js";
import { pool } from "./db/index.js";
import { userRouter } from "./modules/users/user.route.js";
const app: Application = express();
app.use(express.json());

app.use("/api/v1/users", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

export default app;
