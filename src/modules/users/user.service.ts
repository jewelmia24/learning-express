import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import type { IUser } from "./user.interface.js";

const createUserIntoDb = async (payload: IUser) => {
  const { name, email, password, age } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashedPassword, age],
  );
  delete result.rows[0].password;
  return result;
};

const getAllUsersFromDb = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};

const getSingleUserFromDb = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  return result;
};

const updateUserFromDb = async (
  payload: Partial<IUser> & { is_active?: boolean },
  id: string,
) => {
  const { name, password, age, is_active } = payload;
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
  return result;
};

const deleteUserFromDb = async (id: string) => {
  const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  return result;
};

export const userService = {
  createUserIntoDb,
  getAllUsersFromDb,
  getSingleUserFromDb,
  updateUserFromDb,
  deleteUserFromDb,
};
