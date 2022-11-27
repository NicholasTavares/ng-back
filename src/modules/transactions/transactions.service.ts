import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
  ) {}

  @InjectRepository(Transaction)
  private transactionRepository: Repository<Transaction>;

  async findTransactionsByLoggedUser(user_id: string): Promise<Transaction[]> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
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
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
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
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
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
    { credited_user_id, value }: CreateTransactionDTO,
    user_id: string,
  ): Promise<Transaction> {
    const roundedAndConvertedValueToCents = Math.round(value * 100);

    if (roundedAndConvertedValueToCents <= 0) {
      throw new BadRequestException('Invalid value!');
    }

    const accountToBeDebited = await this.accountsService.findAccountByUser(
      user_id,
    );

    const accountToBeDebitedBalance = Number(accountToBeDebited.balance);

    if (accountToBeDebitedBalance < roundedAndConvertedValueToCents) {
      throw new BadRequestException('Insufficient money in the account!');
    }

    const accountToBeCretited = await this.accountsService.findAccountByUser(
      credited_user_id,
    );

    const accountToBeCretitedBalance = Number(accountToBeCretited.balance);

    if (accountToBeDebited.id === accountToBeCretited.id) {
      throw new BadRequestException('Invalid destination!');
    }

    // TRANSACTION

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let transaction: Transaction;

    try {
      const accountToBeDebitedNewBalance =
        accountToBeDebitedBalance - roundedAndConvertedValueToCents;
      const accountDebited = await queryRunner.manager.preload(Account, {
        id: accountToBeDebited.id,
        balance: accountToBeDebitedNewBalance,
      });

      const accountToBeCretitedNewBalance =
        accountToBeCretitedBalance + roundedAndConvertedValueToCents;
      const accountCretited = await queryRunner.manager.preload(Account, {
        id: accountToBeCretited.id,
        balance: accountToBeCretitedNewBalance,
      });

      await queryRunner.manager.save([accountDebited, accountCretited]);

      transaction = queryRunner.manager.create(Transaction, {
        debitedAccount: {
          id: accountDebited.id,
        },
        creditedAccount: {
          id: accountCretited.id,
        },
        value: roundedAndConvertedValueToCents,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error completing transaction!');
    } finally {
      await queryRunner.release();
    }

    return transaction;
  }
}
