import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';
import { User } from 'src/user/user.entity';

export class CreateRoomDto {
  @IsString()
  readonly name: string;

  @IsBoolean()
  readonly isPrivate: boolean;

  @IsOptional()
  @IsString()
  readonly password?: string;

  @IsArray()
  readonly users: User[];

  @IsOptional()
  @IsArray()
  readonly admins: User[];

  @IsOptional()
  @IsArray()
  readonly bannedUsers: User[];
}
