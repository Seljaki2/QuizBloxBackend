import { Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

export enum ClientType {
  PLAYER = 'PLAYER',
  SPECTATOR = 'SPECTATOR',
}

export class JoinSessionDto {
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  joinCode: string;

  @IsEnum(ClientType)
  clientType: ClientType;
}
