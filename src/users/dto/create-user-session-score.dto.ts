import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateUserSessionScoreDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsNumber()
  @IsNotEmpty()
  totalScore: number;
}
