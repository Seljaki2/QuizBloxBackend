import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuestionsModule } from '../questions/questions.module';
import { Subject } from 'src/subjects/entities/subject.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Subject]),
    QuestionsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
