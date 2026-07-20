/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.muizmjnhbekatlrlepop:L60JHW3Ggh6ThEsN@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, email, name, role FROM "User"');
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
