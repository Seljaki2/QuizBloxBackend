import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionsGateway } from './sessions.gateway';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';
import { SessionsService } from './sessions.service';
import { QuizzesModule } from 'src/quizzes/quizzes.module';
import { QuestionsModule } from 'src/questions/questions.module';
import { ResultsModule } from '../results/results.module';
import { AnswersModule } from '../answers/answers.module';
import { SessionsController } from './sessions.controller';
import { Result } from '../results/entities/result.entity';
import { User } from '../users/entities/user.entity';
import { UserSessionScore } from '../users/entities/user-session-score.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Result, User, UserSessionScore]),
    FirebaseModule,
    forwardRef(() => UsersModule),
    forwardRef(() => QuizzesModule),
    QuestionsModule,
    ResultsModule,
    AnswersModule,
  ],
  providers: [SessionsGateway, SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
