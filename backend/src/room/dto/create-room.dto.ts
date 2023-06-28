import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  readonly name: string;

  @IsBoolean()
  readonly isPrivate: boolean;

  @IsOptional()
  @IsString()
  readonly password?: string;
  
  @IsArray()
  readonly users: string[];
  
  @IsOptional()
  @IsArray()
  readonly admins: string[];
  
  @IsOptional()
  @IsArray()
  readonly bannedUsers: string[];
}
