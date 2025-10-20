import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.find();
  }

  async findOne(id: string): Promise<Question | null> {
    return await this.questionsRepository.findOneBy({ id: id });
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    return await this.questionsRepository.save(
      this.questionsRepository.create(createQuestionDto),
    );
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<UpdateResult> {
    return this.questionsRepository.update({ id: id }, updateQuestionDto);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.questionsRepository.delete({ id: id });
  }
}
