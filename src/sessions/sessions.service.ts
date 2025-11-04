import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';
import { Result } from '../results/entities/result.entity';
import { User } from '../users/entities/user.entity';
import { FirebasePayload } from '../auth/get-user.decorator';
import { UserSessionScore } from '../users/entities/user-session-score.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(Result)
    private readonly resultsRepository: Repository<Result>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserSessionScore)
    private readonly usersSessionScore: Repository<UserSessionScore>,
  ) {}

  async findOne(id: string) {
    return await this.sessionsRepository.findOne({
      where: { id: id },
      relations: ['quiz', 'host', 'quiz.questions'],
    });
  }

  create(s: Partial<Session>) {
    return this.sessionsRepository.save(this.sessionsRepository.create(s));
  }

  delete(id: string) {
    return this.sessionsRepository.delete(id);
  }

  async findAllByUser(payload: FirebasePayload) {
    const user = await this.usersRepository.findOneBy({ id: payload.user_id });

    if (!user) {
      return new NotFoundException('User not found');
    }

    const sessions = await (user.isTeacher ? this.sessionsRepository.find({
      where: { host: { id: user.id } },
      relations: ['quiz'],
    }) : this.sessionsRepository
        .createQueryBuilder('session')
        .select('session.id')
        .innerJoin('result', 'result', 'result.sessionId = session.id')
        .where('result.userId = :id', { id: user.id })
        .getMany() )

    return await Promise.all(
      sessions.map((session) =>
        this.findAllResultsBySession(session.id, payload),
      ),
    );
  }

  async findAllResultsBySession(id: string, payload: FirebasePayload) {
    const session = await this.findOne(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    let quizAverageScore = 0;

    const userScore = await this.usersSessionScore.find({
      where: {
        session: { id: id },
        user: { id: payload.user_id },
      },
    });

    const scoresBySession = await this.usersSessionScore.find({
      where: {
        session: { id: id },
      },
    });

    const userQuestionAnswers = await this.resultsRepository.find({
      where: { session: { id: id }, user: { id: payload.user_id } },
      relations: ['question', 'answer', 'user', 'answer.media'],
    });

    scoresBySession.forEach((player) => {
      quizAverageScore += player.totalScore;
    });

    quizAverageScore = quizAverageScore / scoresBySession.length;

    if (session.host.id !== payload.user_id) {
      return {
        quizAverageScore: quizAverageScore,
        userScore: userScore,
        userQuestionAnswers: userQuestionAnswers,
        session: session,
      };
    }

    const results = await this.resultsRepository.find({
      where: { session: { id: id } },
      relations: ['question', 'answer', 'session'],
    });

    //console.log(results)

    const resultsByQuestion = {};
    let averageResultForQuiz = 0;

    results.forEach((result) => {
      if (result.question) {
        const questionId = result.question.id;
        const isCorrect = result.answer?.isCorrect || result.isUserEntryCorrect;

        if (!resultsByQuestion[questionId]) 
          resultsByQuestion[questionId] = 0;

        if (isCorrect)
          resultsByQuestion[questionId]++;
      }
    });

    const averageByQuestion = {};

    Object.entries(resultsByQuestion).forEach(([questionId, avg]) => {
      averageByQuestion[questionId] =
        (Number(avg) / (session.playerCount || 1)) * 100;
    });

    Object.entries(averageByQuestion).forEach(([, avg]) => {
      averageResultForQuiz += Number(avg);
    });

    console.log(Object.entries(resultsByQuestion).length)
    //console.log('session.quiz', session.quiz);

    averageResultForQuiz /= session.quiz.questions.length || 1;

    return {
      resultStatsByQuestionId: resultsByQuestion,
      averageStatsByQuestionId: averageByQuestion,
      quizAveragePercentage: averageResultForQuiz,
      session: session,
      quizAverageScore: quizAverageScore,
      usersScore: scoresBySession,
    };
  }

  async update(id: string, playerCount: number, endTime: Date = new Date()) {
    return await this.sessionsRepository.update(
      { id },
      { playerCount, endTime },
    );
  }
}
