import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User) private readonly user: Repository<User>
  ) {}

  public getAll() {
    return this.user.find()
  }

  public getById(id: string) {
    return this.user.findOne({
      where: {
        id
      }
    })
  }

  public create(newUser: DeepPartial<User>) {
    return this.user.insert(newUser)
  }

  public update(userId: string, updatedUser: Partial<User>) {
    return this.user.update({
      id: userId
    }, updatedUser)
  }

  public deleteUser(userId: string) {
    return this.user.delete({
      id: userId
    })
  }
}
