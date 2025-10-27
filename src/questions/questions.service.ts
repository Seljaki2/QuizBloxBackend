import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Answer } from '../answers/entities/answer.entity';
import { Media } from 'src/media/entities/media.entity';
import { MediaService } from 'src/media/media.service';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuestionType } from './entities/question-type.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(QuestionType)
    private readonly questionsTypeRepository: Repository<QuestionType>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.find({ relations: ['questionType'] });
  }

  async findOne(id: string): Promise<Question | null> {
    return await this.questionsRepository.findOneBy({ id: id });
  }

  async create(
    createQuestionDto: CreateQuestionDto,
    media?: Media,
  ): Promise<Question> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id: createQuestionDto.quizId },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questionType = await this.questionsTypeRepository.findOneBy({
      id: createQuestionDto.questionTypeId,
    });

    const question = await this.questionsRepository.save(
      this.questionsRepository.create({
        ...createQuestionDto,
        questionType: questionType!,
        media,
      }),
    );

    quiz.questions.push(question);

    await this.quizzesRepository.save(quiz);

    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    media?: Media,
  ) {
    const question = await this.findOne(id);

    if (!question) throw new NotFoundException("Question doesn't exist!");

    if (media && question.media) {
      await this.mediaService.deleteMedia(question.media.id);
    }

    const questionType = await this.questionsTypeRepository.findOneBy({
      id: updateQuestionDto.questionTypeId,
    });

    return this.questionsRepository.update(
      { id: id },
      {
        text: updateQuestionDto.text,
        questionType: questionType!,
        media,
      },
    );
  }

  async delete(id: string): Promise<DeleteResult> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    if (!question) throw new NotFoundException("Question doesn't exist!");

    if (question.media) await this.mediaService.deleteMedia(question.media.id);
    return await this.questionsRepository.delete({ id: id });
  }
}
