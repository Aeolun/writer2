import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString ?? "", {
  prepare: false,
  idle_timeout: 5,
});
export const db = drizzle(client, {
  schema,
});