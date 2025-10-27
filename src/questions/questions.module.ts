import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Answer } from '../answers/entities/answer.entity';
import { MediaModule } from 'src/media/media.module';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuestionType } from './entities/question-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, QuestionType, Answer, Quiz]),
    MediaModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
