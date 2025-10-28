import { IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  session: string;
}
