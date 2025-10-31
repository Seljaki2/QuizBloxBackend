import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnwserQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsUUID()
  @IsOptional()
  anwserId?: string;

  @IsString()
  @IsOptional()
  userEntry?: string;
}
