import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateTransaction1669511477752 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
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
            name: 'debitedAccountId',
            type: 'uuid',
          }),
          new TableColumn({
            name: 'creditedAccountId',
            type: 'uuid',
          }),
          new TableColumn({
            name: 'value',
            type: 'integer',
          }),
          new TableColumn({
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['debitedAccountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['creditedAccountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('accounts');
  }
}
