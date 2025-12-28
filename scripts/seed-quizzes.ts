import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import fetch from 'node-fetch';
import { Question, QuestionType } from '../src/questions/entities/question.entity';
import { Answer } from '../src/answers/entities/answer.entity';
import { Quiz } from '../src/quizzes/entities/quiz.entity';
import { Subject } from '../src/subjects/entities/subject.entity';
import { User } from '../src/users/entities/user.entity';
import { Session } from '../src/sessions/entities/session.entity';
import { Result } from '../src/results/entities/result.entity';

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&uuml;/g, 'ü')
    .replace(/&eacute;/g, 'é')
    .replace(/&uuml;/g, 'ü')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function run() {
  console.log('Bootstrapping Nest application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const userRepo = ds.getRepository(User);
  const subjectRepo = ds.getRepository(Subject);
  const questionRepo = ds.getRepository(Question);
  const answerRepo = ds.getRepository(Answer);
  const quizRepo = ds.getRepository(Quiz);
  const sessionRepo = ds.getRepository(Session);
  const resultRepo = ds.getRepository(Result);

  console.log('Ensuring seed users exist...');
  let teacher = await userRepo.findOne({ where: { username: 'seed.trivia.teacher' } });
  if (!teacher) {
    teacher = userRepo.create({
      id: 'seed-teacher',
      firstName: 'Seed',
      lastName: 'Teacher',
      username: 'seed.trivia.teacher',
      email: 'seed.teacher@example.com',
      isTeacher: true,
    });
    await userRepo.save(teacher);
  }

  let playerA = await userRepo.findOne({ where: { username: 'seed.player.a' } });
  if (!playerA) {
    playerA = userRepo.create({
      id: 'seed-player-a',
      firstName: 'Player',
      lastName: 'A',
      username: 'seed.player.a',
      email: 'seed.player.a@example.com',
      isTeacher: false,
    });
    await userRepo.save(playerA);
  }

  let playerB = await userRepo.findOne({ where: { username: 'seed.player.b' } });
  if (!playerB) {
    playerB = userRepo.create({
      id: 'seed-player-b',
      firstName: 'Player',
      lastName: 'B',
      username: 'seed.player.b',
      email: 'seed.player.b@example.com',
      isTeacher: false,
    });
    await userRepo.save(playerB);
  }

  console.log('Creating subject...');
  let subject = await subjectRepo.findOne({ where: { name: 'World Trivia' } });
  if (!subject) {
    subject = subjectRepo.create({ name: 'World Trivia', teacher: [teacher] });
    await subjectRepo.save(subject);
  }

  console.log('Fetching trivia questions from OpenTDB...');
  const amount = 10;
  const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
  if (!res.ok) throw new Error('Failed to fetch trivia questions');
  const data = await res.json();
  if (data.response_code !== 0) throw new Error('OpenTDB returned no questions');

  const fetched = data.results as Array<any>;

  console.log(`Creating ${fetched.length} questions and answers...`);
  const createdQuestions: Question[] = [];

  for (const item of fetched) {
    const text = decodeHtmlEntities(item.question);
    const correct = decodeHtmlEntities(item.correct_answer);
    const incorrects = (item.incorrect_answers || []).map((t: string) => decodeHtmlEntities(t));

    const q = questionRepo.create({
      text,
      questionType: QuestionType.PRESET_ANWSER,
      customTime: 20,
    });

    q.answers = [];
    // shuffle creation order so positions are natural
    const allAnswers = [correct, ...incorrects].map((t: string, idx: number) => ({ text: t, isCorrect: t === correct, position: idx + 1 }));

    q.answers = allAnswers.map((a) => answerRepo.create({ text: a.text, isCorrect: a.isCorrect, position: a.position }));

    const savedQ = await questionRepo.save(q);
    // ensure answers are loaded
    const loadedQ = await questionRepo.findOne({ where: { id: savedQ.id }, relations: ['answers'] });
    if (loadedQ) createdQuestions.push(loadedQ);
  }

  console.log('Creating quiz with fetched questions...');
  const quiz = quizRepo.create({
    name: `OpenTDB Quiz (${new Date().toISOString().slice(0,10)})`,
    description: 'Quiz seeded from Open Trivia DB',
    subject: subject,
    creator: teacher,
    questions: createdQuestions,
    isPublic: true,
  });
  await quizRepo.save(quiz);

  console.log('Creating session...');
  const session = sessionRepo.create({ host: teacher, quiz: quiz, playerCount: 2 });
  await sessionRepo.save(session);

  console.log('Creating sample results tied to questions and answers...');
  const resultsToSave: Result[] = [];
  for (const q of createdQuestions) {
    // pick a correct answer for playerA and a wrong answer for playerB (if possible)
    const correctAnswer = q.answers?.find((a) => a.isCorrect);
    const wrongAnswer = q.answers?.find((a) => !a.isCorrect) || correctAnswer;

    const rA = resultRepo.create({ user: playerA, quiz: quiz, question: q, answer: correctAnswer!, session: session, isUserEntryCorrect: true });
    const rB = resultRepo.create({ user: playerB, quiz: quiz, question: q, answer: wrongAnswer!, session: session, isUserEntryCorrect: wrongAnswer!.isCorrect });

    resultsToSave.push(rA, rB);
  }

  await resultRepo.save(resultsToSave);

  console.log('Seed quizzes complete.');
  await app.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
