import { IsString } from 'class-validator';

export class AnwserQuestionDto {
  @IsString()
  anwser: string;
}
