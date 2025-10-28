import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QuestionType } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @IsOptional()
  options: any;
}
