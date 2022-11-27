module.exports = {
  type: 'postgres',
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT,
  username: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASSWORD,
  database: process.env.DB_MAIN_DATABASE,
  entities: ['dist/modules/**/entities/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  cli: {
    entitiesDir: 'dist/modules/**/entities',
    migrationsDir: 'dist/migrations',
  },
};
