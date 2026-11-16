import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config/index.js";
const app: Application = express();
const port = config.port;
app.use(express.json());

const pool = new Pool({
  connectionString: config.databaseUrl,
});

// console.log(pool);

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      is_active BOOLEAN DEFAULT true,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()

      )
      `);
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
};

initDB();
app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, age } = req.body;
    const result = await pool.query(
      `
      INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *
    `,
      [name, email, password, age],
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;
    const result = await pool.query(
      `
      UPDATE users SET
      name= COALESCE($1,name),
      password = COALESCE($2,password),
      is_active = COALESCE($3,is_active),
      age = COALESCE($4,age),
      updated_at = NOW()
      WHERE id=$5 RETURNING *
      `,
      [name, password, is_active, age, id],
    );
    if (result.rowCount === 0) {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
