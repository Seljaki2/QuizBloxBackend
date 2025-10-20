import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Answer } from '../../answers/entities/answer.entity';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  media: string;

  @IsNotEmpty()
  answers: Answer[];

  @IsOptional()
  options: any;
}
