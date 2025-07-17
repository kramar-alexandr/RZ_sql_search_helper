import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

// Настройте параметры подключения к вашей базе данных PostgreSQL
export const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
    database: process.env.PGDATABASE || 'postgres',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  },
});

// Лог списка таблиц для проверки подключения
db.raw("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'")
  .then(result => {
    const tables = result.rows.map(r => r.tablename);
    console.log('Таблицы в базе данных:', tables);
  })
  .catch(err => {
    console.error('Ошибка подключения к БД или получения списка таблиц:', err.message);
  });
