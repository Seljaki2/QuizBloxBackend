import { IsString } from "class-validator";

export class KickPlayerDto {
  @IsString()
  playerId: string
}