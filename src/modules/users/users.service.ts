import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

const INITIAL_BALANCE_IN_CENTS = 10000; // 100 reais
@Injectable()
export class UsersService {
  @Inject('USERS_REPOSITORY')
  private userRepository: Repository<User>;

  async findAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();

    return users;
  }

  async findUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['account'],
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    return user;
  }

  async findUserByUsernameForAuth(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['password', 'id', 'username'],
    });

    return user;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDTO,
      account: {
        balance: INITIAL_BALANCE_IN_CENTS,
      },
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      }

      throw new InternalServerErrorException();
    }

    return user;
  }

  async updateUser(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDTO,
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    await this.userRepository.save(user);

    return user;
  }

  async softRemoveUser(id: string) {
    const user = await this.findUser(id);
    await this.userRepository.softRemove(user);
  }
}
