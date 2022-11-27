import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    type: 'postgres',
    logging: true,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'westeros',
    database: 'postgres',
    synchronize: false,
    autoLoadEntities: false,
    entities: [__dirname + '/../modules/**/entities/*.entity{.js,.ts}'],
  };
});
