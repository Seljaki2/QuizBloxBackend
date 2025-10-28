import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsBooleanString()
  @IsOptional()
  isCorrect: string;
}
