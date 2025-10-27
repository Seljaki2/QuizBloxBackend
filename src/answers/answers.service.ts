import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Media } from 'src/media/entities/media.entity';
import { MediaService } from 'src/media/media.service';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(): Promise<Answer[]> {
    return await this.answersRepository.find();
  }

  async findOne(id: string): Promise<Answer | null> {
    return await this.answersRepository.findOneBy({ id: id });
  }

  async create(
    createAnswerDto: CreateAnswerDto,
    media?: Media,
  ): Promise<Answer> {
    const question = await this.questionsRepository.findOneBy({
      id: createAnswerDto.questionId,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const answer = this.answersRepository.create({
      text: createAnswerDto.text,
      isCorrect: createAnswerDto.isCorrect !== '0',
      question: question,
      media,
    });

    return await this.answersRepository.save(answer);
  }

  async update(
    id: string,
    updateAnswerDto: UpdateAnswerDto,
    media?: Media,
  ): Promise<UpdateResult> {
    const answer = await this.findOne(id);
    if (!answer) throw new NotFoundException("Anwser doesn't exist!");
    if (media && answer.media)
      await this.mediaService.deleteMedia(answer.media.id);

    const question = await this.questionsRepository.findOneBy({
      id: updateAnswerDto.questionId,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const isCorrect =
      updateAnswerDto.isCorrect != null
        ? updateAnswerDto.isCorrect !== '0'
        : answer.isCorrect;

    return this.answersRepository.update(
      { id: id },
      {
        text: updateAnswerDto.text,
        media: media,
        isCorrect: isCorrect,
        question: question,
      },
    );
  }

  async delete(id: string): Promise<DeleteResult> {
    const answer = await this.findOne(id);
    if (!answer) throw new NotFoundException("Anwser doesn't exist!");
    if (answer.media) await this.mediaService.deleteMedia(answer.media.id);
    return await this.answersRepository.delete({ id: id });
  }
}
