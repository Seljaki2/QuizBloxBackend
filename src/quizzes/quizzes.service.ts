import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Subject } from '../subjects/entities/subject.entity';
import type { FirebasePayload } from '../auth/get-user.decorator';
import { UsersService } from '../users/users.service';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Quiz[]> {
    return await this.quizzesRepository.find({
      relations: ['subject', 'questions', 'creator'],
    });
  }

  async findOne(id: string): Promise<Quiz | null> {
    return await this.quizzesRepository.findOne({
      where: { id: id },
      relations: ['subject', 'questions', 'creator', 'questions.answers.media'],
    });
  }

  async create(
    createQuizDto: CreateQuizDto,
    payload: FirebasePayload,
  ): Promise<Quiz> {
    const subject = await this.subjectRepository.findOneBy({
      id: createQuizDto.subjectId,
    });
    const creator = await this.usersService.getById(payload.user_id);

    return await this.quizzesRepository.save(
      this.quizzesRepository.create({
        name: createQuizDto.name,
        description: createQuizDto.description,
        subject: subject!,
        creator: creator!,
      }),
    );
  }

  async update(
    id: string,
    updateQuizDto: UpdateQuizDto,
  ): Promise<UpdateResult> {
    return await this.quizzesRepository.update(id, updateQuizDto);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.quizzesRepository.delete(id);
  }
}
