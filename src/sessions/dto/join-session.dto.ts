import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ClientType {
  PLAYER = "PLAYER",
  SPECTATOR = "SPECTATOR"
}

export class JoinSessionDto {
  @IsString()
  @Transform(({value}) => value.toUpperCase())
  joinCode: string;

  @IsEnum(ClientType)
  clientType: ClientType
}
