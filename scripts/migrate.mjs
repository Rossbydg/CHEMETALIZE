import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // .env.local not found — fall back to whatever is already in the environment
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("No DATABASE_URL set. Add it to .env.local, then try again.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  await pool.query(`
    create table if not exists _migrations (
      id serial primary key,
      name text unique not null,
      applied_at timestamptz not null default now()
    )
  `);

  const dir = path.join(process.cwd(), "lib", "db", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  const { rows: appliedRows } = await pool.query("select name from _migrations");
  const applied = new Set(appliedRows.map((r) => r.name));

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    console.log(`Applying ${file}...`);
    await pool.query(sql);
    await pool.query("insert into _migrations (name) values ($1)", [file]);
    ran++;
  }

  console.log(ran ? `Applied ${ran} migration(s).` : "Already up to date.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
