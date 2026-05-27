// One-off script to verify the handle_new_user trigger fires.
// Run: node scripts/verify-trigger.mjs
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import pkg from "pg";
const { Client } = pkg;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const pg = new Client({ connectionString: process.env.DIRECT_URL });

const TEST_EMAIL = `trigger-test-${Date.now()}@example.com`;

async function main() {
  await pg.connect();

  console.log(`Creating test user: ${TEST_EMAIL}`);
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    email_confirm: true,
    user_metadata: { first_name: "Trig", last_name: "Test" },
  });
  if (createErr) throw createErr;

  const userId = created.user.id;
  console.log(`Created auth user id=${userId}`);

  const res = await pg.query(
    "SELECT id, email, role, first_name, last_name FROM public.profiles WHERE id = $1",
    [userId],
  );
  if (res.rowCount === 0) {
    console.error("FAIL: profile row was NOT created by trigger");
    process.exitCode = 1;
  } else {
    const row = res.rows[0];
    console.log(
      `PASS: profile row exists. role=${row.role}, first_name=${row.first_name}, last_name=${row.last_name}, email=${row.email}`,
    );
  }

  // Clean up
  await pg.query("DELETE FROM public.profiles WHERE id = $1", [userId]);
  const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
  if (delErr) {
    console.warn("cleanup: failed to delete auth user:", delErr.message);
  } else {
    console.log("Cleaned up test user.");
  }

  await pg.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await pg.end();
  } catch {}
  process.exitCode = 1;
});
