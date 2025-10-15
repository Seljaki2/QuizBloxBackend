import { IsString } from "class-validator";
import { BaseDto } from "src/common/dtos/base.dto";

export class CreateSubjectDto extends BaseDto {
  @IsString()
  name: string
}