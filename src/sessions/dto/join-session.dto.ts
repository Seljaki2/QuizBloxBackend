import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ClientType {
  PLAYER,
  SPECTATOR
}

export class JoinSessionDto {
  @IsString()
  joinCode: string;

  @IsEnum(ClientType)
  clientType: ClientType

  @IsOptional()
  @IsString()
  username?: string
}
