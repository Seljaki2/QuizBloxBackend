/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SessionsService } from './sessions.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { type Server, type Socket } from 'socket.io';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { WsCurrentUser } from 'src/auth/ws-get-user.decorator';
import type { FirebasePayload } from 'src/auth/get-user.decorator';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { User } from 'src/users/entities/user.entity';
import Hashids from 'hashids';
import { v4 as uuidv4 } from 'uuid';
import { QuestionsService } from 'src/questions/questions.service';
import { Quiz } from 'src/quizzes/entities/quiz.entity';
import { JoinSessionDto } from './dto/join-session.dto';
import dayjs from 'dayjs';
import { AnwserQuestionDto } from './dto/anwser-question.dto';

export type QuizState = {
  host: User;
  //results: Result[][],
  quiz: Quiz;
  currentQuestion: number;
  sessionId: string;
  joinCode: string;
  status: 'LOBBY' | 'STARTED';
  anwserDueTime: Date;
};

@WebSocketGateway({
  cors: true,
})
@UsePipes(new ValidationPipe())
export class SessionsGateway {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
  ) {}

  @WebSocketServer()
  server: Server;
  states = new Map<string, QuizState>();
  hids = new Hashids(new Date().toISOString());

  getState(joinCode: string) {
    return this.states.get(joinCode);
  }

  clearState(joinCode: string) {
    this.states.delete(joinCode);
  }

  setState(joinCode: string, state: QuizState) {
    this.states.set(joinCode, state);
  }

  updateState(joinCode: string, state: Partial<QuizState>) {
    const s = this.getState(joinCode);
    this.states.set(joinCode, {
      ...s!,
      ...state,
    });
  }

  async handleConnection(client: Socket) {
    console.log(client.handshake.headers);
    if (client.handshake.headers.is_guest) {
      client.data.isGuest = true;
    } else {
      // auth client
      try {
        const token =
          (client.handshake.auth?.token as string | undefined) ||
          client.handshake.headers?.authorization?.split(' ')[1];
        if (!token) return false; //throw new WsException('No auth token');
        console.log('TOKEN ', token);
        const decodedToken = await this.firebaseService
          .getAuth()
          .verifyIdToken(token);
        const user = await this.usersService.getById(decodedToken.uid);
        console.log(user);
        if (!user) return false; //throw new WsException("User doesn't exist");
        client.data.user = user;
      } catch (error) {
        console.error('Invalid Firebase token:', error);
        throw new WsException('Authentication failed');
      }
    }

    return true;
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    console.log('TEST');
    return 'Hello world!';
  }

  @SubscribeMessage('create-session')
  async createSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() createSessionDto: CreateSessionDto,
    @WsCurrentUser() user: FirebasePayload,
  ) {
    const { quizId } = createSessionDto;
    const host = await this.usersService.getById(user.uid);
    const quiz = await this.quizzesService.findOne(quizId);

    if (!quiz || !host) throw new WsException('User or quizz doesnt exist');

    const id = uuidv4();
    const joinCode = this.hids.encode(id);

    const session = await this.sessionsService.create({
      id,
      quiz,
      host,
      //joinCode
    });

    await client.join(joinCode);
    client.data.joinCode = joinCode;
    client.data.sessionId = id;

    const state: QuizState = {
      host: host,
      sessionId: id,
      joinCode: joinCode,
      currentQuestion: -1,
      quiz,
      status: 'LOBBY',
      anwserDueTime: new Date(),
    };
    this.setState(joinCode, state);

    console.log('generated state ', state);

    return {
      session,
    };
  }

  @SubscribeMessage('join-session')
  joinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() { joinCode }: JoinSessionDto,
  ) {
    const state = this.getState(joinCode);

    if (!state) return { joined: false };

    client.join(joinCode);
  }

  @SubscribeMessage('anwser-question')
  anwserQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() {}: AnwserQuestionDto,
  ) {}

  @SubscribeMessage('next-question')
  nextQuestion(@ConnectedSocket() client: Socket) {
    const joinCode = client.data.joinCode as string;
    this.sendNextQuestion(joinCode);
  }

  @SubscribeMessage('start-quiz')
  startQuiz(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: FirebasePayload,
  ) {
    //this.server.
    const joinCode = client.data.joinCode as string;
    const state = this.getState(joinCode);
    if (!state || state.status !== 'LOBBY') return;

    this.updateState(joinCode, {
      status: 'STARTED',
    });

    this.sendNextQuestion(joinCode);
  }

  sendNextQuestion(joinCode: string) {
    const state = this.getState(joinCode);
    if (!state) return;
    const newQuestionIndex = state.currentQuestion + 1;

    if (newQuestionIndex >= state.quiz.questions.length) return;

    this.updateState(joinCode, {
      currentQuestion: newQuestionIndex,
      anwserDueTime: dayjs().add(30, 'seconds').toDate(),
    });

    this.server.to(joinCode).emit('quiz-started', {
      question: state.quiz.questions[newQuestionIndex],
    });
  }
}
