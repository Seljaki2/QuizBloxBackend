import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { AnswersModule } from '../answers/answers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Result]),
    UsersModule,
    QuizzesModule,
    AnswersModule,
    QuestionsModule,
  ],
  providers: [ResultsService],
  controllers: [ResultsController],
})
export class ResultsModule {}
