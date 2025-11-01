import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { Repository } from 'typeorm';
import { CreateResultDto } from './dto/create-result.dto';
import type { FirebasePayload } from '../auth/get-user.decorator';
import { UsersService } from '../users/users.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { AnswersService } from '../answers/answers.service';
import { Answer } from '../answers/entities/answer.entity';
import { QuestionsService } from '../questions/questions.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private readonly resultsRepository: Repository<Result>,
    private readonly usersService: UsersService,
    private readonly quizzesService: QuizzesService,
    private readonly answersService: AnswersService,
    private readonly questionsService: QuestionsService,
  ) {}

  async findAllByUser(payload: FirebasePayload) {
    const user = await this.usersService.getById(payload.user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.resultsRepository.find({ where: { user: user } });
  }

  async create(createResultDto: CreateResultDto) {
    let user: User | null = null;

    if (createResultDto.userId) {
      user = await this.usersService.getById(createResultDto.userId);
    }

    const quiz = await this.quizzesService.findOne(createResultDto.quizId);
    const question = await this.questionsService.findOne(
      createResultDto.questionId,
    );

    let answer: Answer | null = null;

    if (createResultDto.answerId) {
      answer = await this.answersService.findOne(createResultDto.answerId);
    }

    const result: Result = this.resultsRepository.create({
      user: user ?? undefined,
      username: createResultDto.username ?? undefined,
      quiz: quiz!,
      question: question!,
      answer: answer ?? undefined,
      userEntry: createResultDto.userEntry ?? undefined,
    });

    return await this.resultsRepository.insert(result);
  }
}
