import {
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AnswerQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsUUID()
  @IsOptional()
  answerId?: string;

  @IsString()
  @IsOptional()
  userEntry?: string;

  @IsNumber()
  answerTime: number;

  @IsBooleanString()
  @IsOptional()
  isCustomCorrect?: string;

  @IsNumber()
  bonus: number;
}
