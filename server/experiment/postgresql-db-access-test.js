const { Client } = require('pg')
const client = new Client()

async function test1() {
  await client.connect()
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  console.log(res.rows[0].message) // Hello world!
  await client.end()
}


async function test2() {
  await client.connect()
  const res = await client.query('select * from information_schema.schemata')
  console.log(res.rows[0]) // Hello world!
  await client.end()
}

test2()