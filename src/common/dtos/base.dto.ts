import { IsEmpty } from "class-validator";


export class BaseDto {
  @IsEmpty()
  id?: string

  @IsEmpty()
  createdAt?: Date

  @IsEmpty()
  updatedAt?: Date
}