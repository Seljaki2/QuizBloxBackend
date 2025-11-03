import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateResultDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @IsUUID()
  @IsOptional()
  questionId: string;

  @IsUUID()
  @IsOptional()
  answerId?: string;

  @IsString()
  @IsOptional()
  userEntry?: string;

  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsBooleanString()
  @IsOptional()
  isCustomEntryCorrect?: string;
}
