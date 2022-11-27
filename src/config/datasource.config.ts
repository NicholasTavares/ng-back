import { CreateUser1669344889413 } from 'src/migrations/1669344889413-CreateUser';
import { CreateAccount1669509736420 } from 'src/migrations/1669509736420-CreateAccount';
import { CreateTransaction1669511477752 } from 'src/migrations/1669511477752-CreateTransaction';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  logging: true,
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'westeros',
  database: 'postgres',
  synchronize: false,
  entities: [__dirname + '/../modules/**/entities/*.entity{.js,.ts}'],
  migrations: [
    CreateUser1669344889413,
    CreateAccount1669509736420,
    CreateTransaction1669511477752,
  ],
});
