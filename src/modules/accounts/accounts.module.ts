import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { accountsProviders } from './accounts.providers';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountsService, ...accountsProviders],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
