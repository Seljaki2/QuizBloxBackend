import { IsBoolean, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsString()
  questionId: string;
}
