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
  ) {}
  @WebSocketServer()
  server: Server;

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

    const session = await this.sessionsService.create({
      quiz,
      host,
    });

    await client.join(session.id);

    return {
      session,
    };
  }

  @SubscribeMessage('join-session')
  async joinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() createSessionDto: CreateSessionDto,
  ) {}
}
