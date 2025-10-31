/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SessionsService } from './sessions.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { type Server, Socket } from 'socket.io';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { WsCurrentUser, WsOptionalUser } from 'src/auth/ws-get-user.decorator';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { User } from 'src/users/entities/user.entity';
import Hashids from 'hashids';
import { v4 as uuidv4 } from 'uuid';
import { QuestionsService } from 'src/questions/questions.service';
import { Quiz } from 'src/quizzes/entities/quiz.entity';
import { ClientType, JoinSessionDto } from './dto/join-session.dto';
import { AnwserQuestionDto } from './dto/anwser-question.dto';
import dayjs from 'dayjs';
import { KickPlayerDto } from './dto/kick-player.dto';

type GuestUser = {
  guestUsername: string;
  guestId: string;
};

type QuizAnwser = {
  user: User | GuestUser;
  anwser: string;
};

export type QuizState = {
  host: User;
  results: QuizAnwser[][];
  quiz: Quiz;
  currentQuestion: number;
  sessionId: string;
  joinCode: string;
  status: 'LOBBY' | 'STARTED';
  players: Array<User | GuestUser>;
  anwserDueTime: Date;
};

@WebSocketGateway({
  cors: true,
})
@UseFilters(new BaseWsExceptionFilter())
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
    //console.log(client.handshake.headers);
    console.log('new CONNECTED');
    const username = client.handshake.auth.guestUsername as undefined | string;
    const gid = client.handshake.auth.guestId as undefined | string;
    if (username && gid) {
      console.log('GUEST CONNECTED ', username);
      client.data.isGuest = true;
      const guestUser: GuestUser = {
        guestId: gid,
        guestUsername: username,
      };
      client.data.guestUser = guestUser;
      client.emit('ready');
      return true;
    } else {
      // auth client
      try {
        const token =
          (client.handshake.auth?.token as string | undefined) ||
          client.handshake.headers?.authorization?.split(' ')[1];
        if (!token) return this.dissconectSocket(client); //throw new WsException('No auth token');
        //console.log('TOKEN ', token);
        const decodedToken = await this.firebaseService
          .getAuth()
          .verifyIdToken(token);
        const user = await this.usersService.getById(decodedToken.uid);
        console.log(user);
        if (!user) return this.dissconectSocket(client); //throw new WsException("User doesn't exist");
        client.data.user = user;
        console.log('User connected', user);
        client.emit('ready');
        return true;
      } catch (error) {
        console.error('Invalid Firebase token:', error);
        throw new WsException('Authentication failed');
      }
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user
      ? (client.data.user as User | undefined)
      : (client.data.guestUser as GuestUser | undefined);
    const joinCode = client.data.joinCode as string | undefined;
    if (joinCode && user) {
      this.onUserDissconected(client.data.joinCode as string, user);
      const state = this.getState(joinCode);
      if (state && 'id' in user && user.id === state.host.id)
        this.onQuizEnded(joinCode, state);
    }
  }

  dissconectSocket(socket: Socket) {
    console.log('DISSCONECTING SOCKET');
    socket.disconnect(true);
    return false;
  }

  @SubscribeMessage('create-session')
  async createSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() createSessionDto: CreateSessionDto,
    @WsCurrentUser() user: User,
  ) {
    const { quizId } = createSessionDto;
    const host = await this.usersService.getById(user.id);
    const quiz = await this.quizzesService.findOne(quizId);

    if (!quiz || !host) throw new WsException('User or quizz doesnt exist');

    const id = uuidv4();
    const hexId = id.replace(/-/g, '');
    const joinCode = this.hids.encodeHex(hexId).substring(0, 6).toUpperCase();

    const session = await this.sessionsService.create({
      id,
      quiz,
      host,
      //joinCode
    });

    await client.join(joinCode);
    client.data.joinCode = joinCode;

    const state: QuizState = {
      host: host,
      sessionId: id,
      joinCode: joinCode,
      currentQuestion: -1,
      quiz,
      status: 'LOBBY',
      players: [],
      anwserDueTime: new Date(),
      results: [],
    };
    this.setState(joinCode, state);

    console.log('generated state ', state);

    return {
      session,
      joinCode,
      quiz,
    };
  }

  @SubscribeMessage('join-session')
  async joinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() { joinCode, clientType }: JoinSessionDto,
    @WsOptionalUser() user: User | GuestUser,
  ) {
    const state = this.getState(joinCode);

    if (!state || !user) return { joined: false };

    await client.join(joinCode);
    const id = 'id' in user ? user.id : user.guestId;
    await client.join(id);
    client.data.joinCode = joinCode;
    client.data.clientType = clientType;

    if (clientType === ClientType.PLAYER) {
      const u = user;
      const newPlayers = [...state.players, u];
      this.updateState(joinCode, {
        players: newPlayers,
      });
      console.log('USER JOINED SESSION ', u);

      client.to(joinCode).emit('player-joined', {
        user: u,
        users: newPlayers,
      });

      return {
        players: newPlayers,
        quiz: state.quiz,
      };
    }
  }

  @SubscribeMessage('anwser-question')
  anwserQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() { anwser }: AnwserQuestionDto,
    @WsOptionalUser() user: User | GuestUser,
  ) {
    console.log('ANWSER QUESTIUONB');
    const joinCode = client.data.joinCode as string | undefined;
    if (!joinCode) return false;
    const state = this.getState(joinCode);
    if (!state) return false;
    if (state.anwserDueTime < new Date()) return false;
    console.log('vse je validno');
    const id = 'id' in user ? user.id : user.guestId;
    const anwsered = !!state.results
      .at(-1)!
      .find(({ user: u }) => ('id' in u ? u.id === id : u.guestId === id));
    console.log('anwsered ', anwsered);
    if (!anwsered) return false;

    const quizAnwser: QuizAnwser = {
      user,
      anwser,
    };

    state.results.at(-1)!.push(quizAnwser);

    this.server.to(joinCode).emit('player-anwsered', {
      user,
      quizAnwser,
    });

    return true;
  }

  @SubscribeMessage('kick-player')
  kickPlayer(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: User,
    @MessageBody() { playerId }: KickPlayerDto,
  ) {
    const joinCode = client.data.joinCode as string | undefined;
    if (!joinCode) return;
    const state = this.getState(joinCode);
    if (!state) return;
    if (user.id === state.host.id) {
      this.onUserDissconected(joinCode, user);
      this.server.to(playerId).disconnectSockets();
    }
  }

  @SubscribeMessage('close-session')
  closeSession(
    @ConnectedSocket() client: Socket,
    //@WsCurrentUser() user: User,
    // @MessageBody() { sessionId }: CloseSessionDto
  ) {
    //this.sessionsService.delete(sessionId)
    this.onQuizEnded(
      client.data.joinCode,
      this.getState(client.data.joinCode)!,
    );
  }

  @SubscribeMessage('next-question')
  nextQuestion(@ConnectedSocket() client: Socket) {
    const joinCode = client.data.joinCode as string;
    this.sendNextQuestion(joinCode);
  }

  @SubscribeMessage('start-quiz')
  startQuiz(@ConnectedSocket() client: Socket) {
    //this.server.
    const joinCode = client.data.joinCode as string;
    const state = this.getState(joinCode);
    if (!state || state.status !== 'LOBBY') return;

    this.updateState(joinCode, {
      status: 'STARTED',
    });

    this.sendNextQuestion(joinCode);
  }

  async sendNextQuestion(joinCode: string) {
    const state = this.getState(joinCode);
    if (!state) return;
    const newQuestionIndex = state.currentQuestion + 1;

    if (newQuestionIndex >= state.quiz.questions.length) {
      this.onQuizEnded(joinCode, state);
      return;
    }
    const question = state.quiz.questions[newQuestionIndex];
    state.results.push([]);
    const dueTime = dayjs().add(question.customTime, 'seconds').toDate();
    this.updateState(joinCode, {
      currentQuestion: newQuestionIndex,
      anwserDueTime: dueTime,
      results: state.results,
    });

    const sockets = await this.server.in(joinCode).fetchSockets();
    console.log('num of sockets in ', joinCode, sockets.length, sockets);

    this.server.to(joinCode).emit('next-question', {
      question,
      index: newQuestionIndex,
      dueTime,
    });
  }

  onQuizEnded(joinCode: string, state: QuizState) {
    this.server.to(joinCode).emit('quiz-ended', {
      results: state.results,
    });

    this.server.to(joinCode).disconnectSockets();
    this.clearState(joinCode);
    console.log(state);
  }

  onUserDissconected(joinCode: string, user: User | GuestUser) {
    const state = this.getState(joinCode)!;
    const p = state.players.filter((u) => u != user);
    this.updateState(joinCode, {
      players: p,
    });

    this.server.to(joinCode).emit('player-disconnected', {
      user,
      users: p,
    });
  }
}
