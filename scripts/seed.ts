import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Subject } from '../src/subjects/entities/subject.entity';
import { Question, QuestionType } from '../src/questions/entities/question.entity';
import { Answer } from '../src/answers/entities/answer.entity';
import { Quiz } from '../src/quizzes/entities/quiz.entity';
import { Session } from '../src/sessions/entities/session.entity';
import { Result } from '../src/results/entities/result.entity';

async function run() {
  console.log('Bootstrapping Nest application context...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const ds = app.get(DataSource);

  // WARNING: the following will DROP & re-create the schema to ensure a clean seed
  console.log('Synchronizing database (drop before sync) - this will clear all data');
  await ds.synchronize(true);

  const userRepo = ds.getRepository(User);
  const subjectRepo = ds.getRepository(Subject);
  const questionRepo = ds.getRepository(Question);
  const answerRepo = ds.getRepository(Answer);
  const quizRepo = ds.getRepository(Quiz);
  const sessionRepo = ds.getRepository(Session);
  const resultRepo = ds.getRepository(Result);

  console.log('Creating users...');
  const teacher = userRepo.create({
    id: 'teacher1',
    firstName: 'Alice',
    lastName: 'Teacher',
    username: 'alice.teacher',
    email: 'alice.teacher@example.com',
    isTeacher: true,
    isAdmin: false,
  });

  const player1 = userRepo.create({
    id: 'player1',
    firstName: 'Bob',
    lastName: 'Player',
    username: 'bob.player',
    email: 'bob.player@example.com',
    isTeacher: false,
  });

  const player2 = userRepo.create({
    id: 'player2',
    firstName: 'Carol',
    lastName: 'Player',
    username: 'carol.player',
    email: 'carol.player@example.com',
    isTeacher: false,
  });

  await userRepo.save([teacher, player1, player2]);

  console.log('Creating subject...');
  const subject = subjectRepo.create({ name: 'General Knowledge', teacher: [teacher] });
  await subjectRepo.save(subject);

  console.log('Creating questions and answers...');
  const q1 = questionRepo.create({
    text: 'What is the capital of France?',
    questionType: QuestionType.PRESET_ANWSER,
    customTime: 20,
  });
  q1.answers = [
    answerRepo.create({ text: 'Paris', isCorrect: true, position: 1 }),
    answerRepo.create({ text: 'Madrid', isCorrect: false, position: 2 }),
    answerRepo.create({ text: 'Rome', isCorrect: false, position: 3 }),
  ];

  const q2 = questionRepo.create({
    text: '2 + 2 = ?',
    questionType: QuestionType.PRESET_ANWSER,
    customTime: 10,
  });
  q2.answers = [
    answerRepo.create({ text: '3', isCorrect: false, position: 1 }),
    answerRepo.create({ text: '4', isCorrect: true, position: 2 }),
    answerRepo.create({ text: '22', isCorrect: false, position: 3 }),
  ];

  await questionRepo.save([q1, q2]);

  console.log('Creating quiz...');
  const quiz = quizRepo.create({
    name: 'Seeded Quiz',
    description: 'A small seeded quiz',
    subject: subject,
    creator: teacher,
    questions: [q1, q2],
    isPublic: true,
  });
  await quizRepo.save(quiz);

  console.log('Creating session...');
  const session = sessionRepo.create({ host: teacher, quiz: quiz, playerCount: 2 });
  await sessionRepo.save(session);

  console.log('Creating results for players...');
  // find correct answer for q1 and q2
  const q1Correct = q1.answers?.find((a) => a.isCorrect);
  const q2Correct = q2.answers?.find((a) => a.isCorrect);

  const r1 = resultRepo.create({
    user: player1,
    username: undefined,
    quiz: quiz,
    question: q1,
    answer: q1Correct,
    session: session,
    isUserEntryCorrect: true,
  });

  const r2 = resultRepo.create({
    user: player2,
    username: undefined,
    quiz: quiz,
    question: q1,
    answer: q1.answers?.find((a) => !a.isCorrect),
    session: session,
    isUserEntryCorrect: false,
  });

  const r3 = resultRepo.create({
    user: player1,
    username: undefined,
    quiz: quiz,
    question: q2,
    answer: q2Correct,
    session: session,
    isUserEntryCorrect: true,
  });

  const r4 = resultRepo.create({
    user: player2,
    username: undefined,
    quiz: quiz,
    question: q2,
    answer: q2.answers?.find((a) => !a.isCorrect),
    session: session,
    isUserEntryCorrect: false,
  });

  await resultRepo.save([r1, r2, r3, r4]);

  console.log('Seeding complete.');
  await app.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
