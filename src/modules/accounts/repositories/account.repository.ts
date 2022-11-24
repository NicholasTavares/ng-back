import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Account } from '../entities/account.entity';

export class AccountRepository extends Repository<Account> {
  constructor(private dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }

  async findAccountByUser(user_id: string): Promise<Account> {
    const account = await this.findOne({
      where: {
        user_id,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account not found`);
    }

    return account;
  }

  async updateAccountBalance(id: string, balance: number): Promise<Account> {
    const account = await this.preload({
      id,
      balance,
    });

    if (!account) {
      throw new NotFoundException(`Account not found`);
    }

    await this.save(account);

    return account;
  }
}
