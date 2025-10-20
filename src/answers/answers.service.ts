import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async findAll(): Promise<Answer[]> {
    return await this.answersRepository.find();
  }

  async findOne(id: string): Promise<Answer | null> {
    return await this.answersRepository.findOneBy({ id: id });
  }

  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    return await this.answersRepository.save(
      this.answersRepository.create(createAnswerDto),
    );
  }

  async update(
    id: string,
    updateAnswerDto: UpdateAnswerDto,
  ): Promise<UpdateResult> {
    return this.answersRepository.update({ id: id }, updateAnswerDto);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.answersRepository.delete({ id: id });
  }
}
