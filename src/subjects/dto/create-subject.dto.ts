import { IsString } from "class-validator";
import { BaseDto } from "src/common/dtos/base.dto";

export class CreateUserDto extends BaseDto {
  @IsString()
  name: string
}