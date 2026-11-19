import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config/index.js";
import { pool } from "./db/index.js";
import { userRouter } from "./modules/users/user.route.js";
import { profileRoute } from "./modules/profile/profile.route.js";
import { authRoute } from "./modules/auth/auth.route.js";
const app: Application = express();
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRoute);
app.use("/api/v1/auth", authRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

export default app;
