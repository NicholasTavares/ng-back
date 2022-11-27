import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateUser1669344889413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isUnique: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          }),
          new TableColumn({
            name: 'username',
            type: 'varchar',
            isUnique: true,
          }),
          new TableColumn({
            name: 'password',
            type: 'varchar',
            isUnique: true,
          }),
          new TableColumn({
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          }),
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          }),
          new TableColumn({
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
