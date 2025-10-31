/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user as User;
    if (!user) 
      throw new Error('User not found on WebSocket context.');
    
    return user;
  },
);

export const WsOptionalUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User | undefined => {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user ? client.data.user as User : client.data.guestUser as User;
    console.log(user)
    if (!user) 
      throw new Error('User or guest user not found on WebSocket context.');
    
    return user;
  },
);