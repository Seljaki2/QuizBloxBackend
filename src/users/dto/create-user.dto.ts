import { IsBoolean, IsEmpty, IsString } from "class-validator";
import { BaseDto } from "src/common/dtos/base.dto";

export class CreateUserDto extends BaseDto {
  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsString()
  username: string

  @IsBoolean()
  isTeacher: boolean

  @IsEmpty()
  isAdmin?: boolean
}