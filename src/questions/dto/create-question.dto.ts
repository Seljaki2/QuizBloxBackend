import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsNotEmpty()
  answers: string[];

  @IsNotEmpty()
  correctAnswer: string;

  @IsOptional()
  options: any;
}
