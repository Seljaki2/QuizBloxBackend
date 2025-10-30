import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Socket } from 'socket.io';
import { FirebasePayload } from './get-user.decorator';
import { User } from 'src/users/entities/user.entity';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;
    if (!user) 
      throw new Error('User not found on WebSocket context.');
    
    return user;
  },
);

export const WsOptionalUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User | undefined => {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;
    
    return user;
  },
);