const { Client } = require('pg')

async function createDbFromUrl(dbUrlString) {
  const url = new URL(dbUrlString)
  const dbName = url.pathname.slice(1)

  const client = new Client({
    host: url.hostname,
    port: url.port || 5432,
    user: url.username,
    password: url.password,
    database: 'postgres',
    ssl: process.env.SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
  })

  await client.connect()

  const exists = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName]
  )

  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`)
    console.log(`Database "${dbName}" created`)
  }

  await client.end()
}

module.exports = createDbFromUrl
