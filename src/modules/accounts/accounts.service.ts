import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  @InjectRepository(Account)
  private accountRepository: Repository<Account>;

  async findAccountByUser(user_id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {
        user_id,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account of user ${user_id} not found`);
    }

    return account;
  }

  async updateAccountBalance(
    account_id: string,
    balance: number,
  ): Promise<Account> {
    const account = await this.accountRepository.preload({
      id: account_id,
      balance,
    });

    if (!account) {
      throw new NotFoundException(`Account ID ${account_id} not found`);
    }

    await this.accountRepository.save(account);

    return account;
  }
}
