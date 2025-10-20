import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Answer } from '../answers/entities/answer.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.find();
  }

  async findOne(id: string): Promise<Question | null> {
    return await this.questionsRepository.findOneBy({ id: id });
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const answers: Answer[] = [];

    for (const answerText of createQuestionDto.answers) {
      let answer = await this.answersRepository.findOneBy({
        text: answerText,
      });

      if (!answer) {
        answer = await this.answersRepository.save(
          this.answersRepository.create({ text: answerText }),
        );
      }

      answers.push(answer);
    }

    const correctAnswer = await this.answersRepository.findOneBy({
      text: createQuestionDto.correctAnswer,
    });

    return await this.questionsRepository.save(
      this.questionsRepository.create({
        ...createQuestionDto,
        answers: answers,
        correctAnswer: correctAnswer!,
      }),
    );
  }

  /*
  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<UpdateResult> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    return this.questionsRepository.update({ id: id }, updateQuestionDto);
  }
  */

  async delete(id: string): Promise<DeleteResult> {
    return await this.questionsRepository.delete({ id: id });
  }
}
