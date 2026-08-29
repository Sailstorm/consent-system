import { pool } from "../db.js";

try {
  const database = await pool.query("SELECT current_database() AS name, NOW() AS time");
  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log({
    database: database.rows[0],
    tables: tables.rows.map((row) => row.table_name),
  });
} finally {
  await pool.end();
}

