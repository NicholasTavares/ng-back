import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountsService: AccountsService,
  ) {}

  async findTransactionsByLoggedUser(user_id: string): Promise<Transaction[]> {
    const transactions =
      await this.transactionRepository.findTransactionsByLoggedUser(user_id);

    return transactions;
  }

  async findDebitedTransactionsByLoggedUser(
    user_id: string,
  ): Promise<Transaction[]> {
    const transactions =
      await this.transactionRepository.findDebitedTransactionsByLoggedUser(
        user_id,
      );

    return transactions;
  }

  async findCreditedTransactionsByLoggedUser(
    user_id: string,
  ): Promise<Transaction[]> {
    const transactions =
      await this.transactionRepository.findCreditedTransactionsByLoggedUser(
        user_id,
      );

    return transactions;
  }

  async createTransaction(
    { credited_user_id, value }: CreateTransactionDTO,
    user_id: string,
  ): Promise<Transaction> {
    const roundedAndConvertedValueToCents = Math.round(value * 100);

    if (roundedAndConvertedValueToCents <= 0) {
      throw new BadRequestException('Valor inválido');
    }

    const accountToBeDebited = await this.accountsService.findAccountByUser(
      user_id,
    );

    const accountToBeDebitedBalance = Number(accountToBeDebited.balance);

    if (accountToBeDebitedBalance < roundedAndConvertedValueToCents) {
      throw new BadRequestException('Saldo insuficiente.');
    }

    const accountToBeCretited = await this.accountsService.findAccountByUser(
      credited_user_id,
    );

    const accountToBeCretitedBalance = Number(accountToBeCretited.balance);

    if (accountToBeDebited.id === accountToBeCretited.id) {
      throw new BadRequestException('Conta de destino inválida.');
    }

    const transaction = await this.transactionRepository.createTransaction(
      accountToBeDebitedBalance,
      accountToBeCretitedBalance,
      accountToBeDebited.id,
      accountToBeCretited.id,
      roundedAndConvertedValueToCents,
    );

    return transaction;
  }
}
