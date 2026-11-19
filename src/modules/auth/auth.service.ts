import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import jwt from "jsonwebtoken";

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  if (user.rowCount === 0) {
    throw new Error("Invalid email or password");
  }
  const userData = user.rows[0];
  const machPassword = await bcrypt.compare(password, userData.password);
  if (!machPassword) {
    throw new Error("Invalid email or password");
  }
  if (!userData.is_active) {
    throw new Error("User is not active");
  }

  const jwtPayload = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
  };

  const accessToken = await jwt.sign(jwtPayload, "dkdshfkjasjd", {
    expiresIn: "1d",
  });

  delete userData.password;

  return {
    accessToken,
    user: userData,
  };
};

export const authService = {
  loginUserIntoDb,
};
