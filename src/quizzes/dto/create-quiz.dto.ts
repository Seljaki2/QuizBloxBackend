import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateQuestionDto } from '../../questions/dto/create-question.dto';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsArray()
  @IsNotEmpty()
  questions: CreateQuestionDto[];
}
