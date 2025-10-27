import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;
}
