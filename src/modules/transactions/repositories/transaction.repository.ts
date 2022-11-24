import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { Account } from 'src/modules/accounts/entities/account.entity';

export class TransactionRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async findTransactionsByLoggedUser(user_id: string): Promise<Transaction[]> {
    const transactions = await this.createQueryBuilder('transaction')
      .innerJoin('transaction.debitedAccount', 'debitedAccount')
      .innerJoin('transaction.creditedAccount', 'creditedAccount')
      .innerJoin('debitedAccount.user', 'debitedAccountUser')
      .innerJoin('creditedAccount.user', 'creditedAccountUser')
      .where([
        {
          creditedAccount: {
            user_id,
          },
        },
        {
          debitedAccount: {
            user_id,
          },
        },
      ])
      .select(['transaction.id', 'transaction.value', 'transaction.created_at'])
      .addSelect([
        'debitedAccountUser.username',
        'creditedAccountUser.username',
      ])
      .orderBy('transaction.created_at', 'DESC')
      .getRawMany();

    return transactions;
  }

  async findDebitedTransactionsByLoggedUser(
    user_id: string,
  ): Promise<Transaction[]> {
    const transactions = await this.createQueryBuilder('transaction')
      .innerJoin('transaction.debitedAccount', 'debitedAccount')
      .innerJoin('transaction.creditedAccount', 'creditedAccount')
      .innerJoin('debitedAccount.user', 'debitedAccountUser')
      .innerJoin('creditedAccount.user', 'creditedAccountUser')
      .where({
        debitedAccount: {
          user_id,
        },
      })
      .select(['transaction.id', 'transaction.value', 'transaction.created_at'])
      .addSelect([
        'debitedAccountUser.username',
        'creditedAccountUser.username',
      ])
      .getRawMany();

    return transactions;
  }

  async findCreditedTransactionsByLoggedUser(
    user_id: string,
  ): Promise<Transaction[]> {
    const transactions = await this.createQueryBuilder('transaction')
      .innerJoin('transaction.debitedAccount', 'debitedAccount')
      .innerJoin('transaction.creditedAccount', 'creditedAccount')
      .innerJoin('debitedAccount.user', 'debitedAccountUser')
      .innerJoin('creditedAccount.user', 'creditedAccountUser')
      .where({
        creditedAccount: {
          user_id,
        },
      })
      .select(['transaction.id', 'transaction.value', 'transaction.created_at'])
      .addSelect([
        'debitedAccountUser.username',
        'creditedAccountUser.username',
      ])
      .getRawMany();

    return transactions;
  }

  async createTransaction(
    accountToBeDebitedBalance: number,
    accountToBeCretitedBalance: number,
    accountToBeDebitedId: string,
    accountToBeCretitedId: string,
    value: number,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let transaction: Transaction;

    // using queryRunner.manager entityManager because of typeorm transaction limitation
    // is not possible to use transaction with custom repositories and services from others modules

    try {
      const accountToBeDebitedNewBalance = accountToBeDebitedBalance - value;
      const accountToBeDebited = await queryRunner.manager.preload(Account, {
        id: accountToBeDebitedId,
        balance: accountToBeDebitedNewBalance,
      });

      const accountToBeCretitedNewBalance = accountToBeCretitedBalance + value;
      const accountToBeCretited = await queryRunner.manager.preload(Account, {
        id: accountToBeCretitedId,
        balance: accountToBeCretitedNewBalance,
      });

      await queryRunner.manager.save([accountToBeDebited, accountToBeCretited]);

      transaction = queryRunner.manager.create(Transaction, {
        debitedAccount: {
          id: accountToBeDebitedId,
        },
        creditedAccount: {
          id: accountToBeCretitedId,
        },
        value,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Erro ao concluir transação!');
    } finally {
      await queryRunner.release();
    }

    return transaction;
  }
}
