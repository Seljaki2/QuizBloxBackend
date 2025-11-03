import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserSessionScoreDto } from './dto/create-user-session-score.dto';
import { UserSessionScore } from './entities/user-session-score.entity';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(UserSessionScore)
    private readonly userSessionScoreRepository: Repository<UserSessionScore>,
    private readonly sessionsService: SessionsService,
  ) {}

  public getAll() {
    return this.user.find();
  }

  public getById(id: string) {
    return this.user.findOne({
      where: {
        id,
      },
    });
  }

  public create(newUser: DeepPartial<User>) {
    return this.user.insert(newUser);
  }

  async createSessionScore(
    createUserSessionScoreDto: CreateUserSessionScoreDto,
  ) {
    const user = await this.getById(createUserSessionScoreDto.userId);
    const session = await this.sessionsService.findOne(
      createUserSessionScoreDto.sessionId,
    );

    return await this.userSessionScoreRepository.insert({
      user: user ?? undefined,
      session: session!,
      totalScore: createUserSessionScoreDto.totalScore,
    });
  }

  public update(userId: string, updatedUser: Partial<User>) {
    return this.user.update(
      {
        id: userId,
      },
      updatedUser,
    );
  }

  public deleteUser(userId: string) {
    return this.user.delete({
      id: userId,
    });
  }
}
