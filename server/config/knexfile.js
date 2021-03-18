// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/dev.sqlite3'
    },
    migrations: {
      directory: '../db/migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    connectionCheck: "SELECT 'Connected to development database' as message;"
  },

  staging: {
    client: 'pg',
    connection: {
      database: 'viewport',
      user:     'viewport'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../db/migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    connectionCheck: "SELECT 'Connected to staging database' as message;"
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL+'?sslmode=require',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../db/migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    connectionCheck: "SELECT 'Connected to production database' as message;"
  }

}
