import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Subject } from '../subjects/entities/subject.entity';
import { QuestionsService } from '../questions/questions.service';
import type { FirebasePayload } from '../auth/get-user.decorator';
import { UsersService } from '../users/users.service';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly questionsService: QuestionsService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Quiz[]> {
    return await this.quizzesRepository.find({
      relations: ['questions', 'questions.answers', 'questions.correctAnswer'],
    });
  }

  async findOne(id: string): Promise<Quiz | null> {
    return await this.quizzesRepository.findOneBy({ id: id });
  }

  async create(
    createQuizDto: CreateQuizDto,
    payload: FirebasePayload,
  ): Promise<Quiz> {
    const subject = await this.subjectRepository.findOneBy({
      name: createQuizDto.subject,
    });

    if (!subject) {
      throw new NotFoundException(`Subject ${createQuizDto.subject} not found`);
    }

    const creator = await this.usersService.getById(payload.user_id);

    if (!creator) {
      throw new NotFoundException('User not found');
    }

    const questions: Question[] = [];

    for (const createQuestionDto of createQuizDto.questions) {
      const question = await this.questionsService.create(createQuestionDto);
      questions.push(question);
    }

    return await this.quizzesRepository.save(
      this.quizzesRepository.create({
        name: createQuizDto.name,
        description: createQuizDto.description,
        subject,
        creator,
        questions,
      }),
    );
  }

  async update(id: string, updatedQuiz: Partial<Quiz>): Promise<UpdateResult> {
    return await this.quizzesRepository.update(id, updatedQuiz);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.quizzesRepository.delete(id);
  }
}
