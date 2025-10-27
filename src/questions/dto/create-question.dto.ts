import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  questionTypeId: string;

  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @IsOptional()
  options: any;
}
