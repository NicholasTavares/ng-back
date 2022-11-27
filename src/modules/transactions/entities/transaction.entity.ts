import { Account } from 'src/modules/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'debitedAccountId' })
  debitedAccountId: string;

  @ManyToOne(() => Account, (user) => user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'debitedAccountId' })
  debitedAccount: Account;

  @Column({ name: 'creditedAccountId' })
  creditedAccountId: string;

  @ManyToOne(() => Account, (user) => user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creditedAccountId' })
  creditedAccount: Account;

  @Column({ type: 'integer' })
  value: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
