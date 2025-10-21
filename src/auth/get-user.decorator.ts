import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type DecodedIdToken } from 'firebase-admin/auth';

export interface FirebasePayload extends DecodedIdToken {
  user_id: string;
}

export const GetPayload = createParamDecorator(
  (_data, ctx: ExecutionContext): FirebasePayload => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
