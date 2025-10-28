import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { type Server, type Socket } from 'socket.io';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
  cors: true
})
@UsePipes(new ValidationPipe())
export class SessionsGateway {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService
  ) {}
  @WebSocketServer()
  server: Server;
  
  async handleConnection(client: Socket) {
    console.log(client.handshake.headers)
    if(client.handshake.headers.is_guest) {
      client.data.isGuest = true
    } else { // auth client
      try {
        const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
        const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token)
        const user = await this.usersService.getById(decodedToken.uid)
        if(!user) throw new WsException("User doesn't exist")
        client.data.user = user
      } catch (error) {
        console.error('Invalid Firebase token:', error);
        throw new WsException('Authentication failed');
      }
    }

    return true
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    console.log("TEST")
    return 'Hello world!';
  }
}
