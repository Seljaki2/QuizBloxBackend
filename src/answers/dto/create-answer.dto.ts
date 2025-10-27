import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  isCorrect: string;
}
