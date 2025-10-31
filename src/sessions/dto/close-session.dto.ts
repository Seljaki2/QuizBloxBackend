import { IsUUID } from "class-validator";

export class CloseSessionDto {
  @IsUUID()
  sessionId: string
}