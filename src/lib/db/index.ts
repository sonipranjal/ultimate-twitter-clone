import Pool from "pg-pool";

export const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
  allowExitOnIdle: true,
});
