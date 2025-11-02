import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    FirebaseModule,
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    AnswersModule,
  ],
  providers: [SessionsGateway, SessionsService],
})
export class SessionsModule {}
